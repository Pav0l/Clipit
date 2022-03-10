package auth

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"

	"github.com/clip-it/server/foundation/twitchoauth"
	"github.com/golang-jwt/jwt/v4"
)

type Auth struct {
	parser *jwt.Parser
	keyFunc jwt.Keyfunc
	twitchOauth *twitchoauth.TwitchOauth
}

type TwitchCfg struct {
	ClientId string
	ClientSecret string
	EbsSecret string
}

type ValidToken struct {
	Token string
	UserId string
}

func NewAuth(cfg TwitchCfg) *Auth {
	parser := jwt.NewParser(jwt.WithValidMethods([]string{"HS256"}))

	keyFunc := func(token *jwt.Token) (interface{}, error) {
		decoded, err := base64.StdEncoding.DecodeString(cfg.EbsSecret)
		if err != nil {
			return nil, fmt.Errorf("decoding secret: %w", err)
		}

		return decoded, nil
	}

	return &Auth{
		parser: parser,
		keyFunc: keyFunc,
		twitchOauth: twitchoauth.NewTwitchOauth(twitchoauth.TwitchCfg{
			ClientId: cfg.ClientId,
			ClientSecret: cfg.ClientSecret,
		}),
	}
}

func (auth *Auth) ValidateTokenForScheme(authScheme, token string) (ValidToken, error) {

	if authScheme == "bearer" {
		// TODO log externalCall
		token, err := auth.twitchOauth.ValidateToken(token)
		if err != nil {
			// TODO log externalCallError
			return ValidToken{}, errors.New("invalid twitch oauth bearer token")
		}
		return ValidToken{
			Token: token.Token,
			UserId: token.User_id,
		}, nil

	} else if authScheme == "ebs" {
		// verify twitch JWT
		jwtPayload, err := auth.VerifyJwt(token)
		if err != nil {
			return ValidToken{}, err
		}

		if jwtPayload.UserId == "" {
			return ValidToken{}, errors.New("user can not be identified")
		}

		// TODO log externalCall
		appToken, err := auth.twitchOauth.RequestAppAccessToken()
		if err != nil {
			// TODO log externalCallError
			return ValidToken{}, fmt.Errorf("request to app access token: %w", err)
		}

		return ValidToken{
			Token: appToken.AccessToken,
			UserId: jwtPayload.UserId,
		}, nil
	}

	return ValidToken{}, fmt.Errorf("unknown auth scheme: %s", authScheme)
}

type JwtPayload struct {
	Expires uint `json:"exp"`  
	// Broadcasters’ tokens are set with "U" + their Twitch user IDs, to avoid confusing opaque IDs with user IDs when the broadcaster is a viewer.
	OpaqueUserId string `json:"opaque_user_id"`
	UserId string `json:"user_id"`
  ChannelId string `json:"channel_id"`
  Role string `json:"role"`
  IsUnlinked bool `json:"is_unlinked"`
  PubSubPerms struct{
    Listen []string `json:"listen"`
    Send []string	`json:"send"`
  } `json:"pubsub_perms"`
	jwt.RegisteredClaims
}

func (auth *Auth) VerifyJwt(token string) (JwtPayload, error) {
	var payload JwtPayload
	// TODO verify if token is not expired
	_, err := auth.parser.ParseWithClaims(token, &payload, auth.keyFunc)
	if err != nil {
		return JwtPayload{}, fmt.Errorf("invalid token: %w", err)
	}

	return payload, nil
}

type ctxKey int

const key ctxKey = 1

// SetToken stores token data from validating twitch access token
func SetToken(ctx context.Context, token ValidToken) context.Context {
	return context.WithValue(ctx, key, token)
}

// GetToken returns token data from context set by Authenticate middleware
func GetToken(ctx context.Context) (ValidToken, error) {
	t, ok := ctx.Value(key).(ValidToken)
	if !ok {
		return ValidToken{}, errors.New("valid token value missing from request context")
	}
	return t, nil
}
