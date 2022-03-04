package game

import (
	"fmt"

	"github.com/clip-it/server/foundation/twitchapi"
)

type Core struct {
	TwitchApi *twitchapi.TwitchApi
}

type Result struct {
	Name string
	Err error
}

func NewCore(twitchapi *twitchapi.TwitchApi) Core {
	return Core{
		TwitchApi: twitchapi,
	}
}

func (core *Core) GetGame(id string, token string, c chan Result) {
	game, err := core.TwitchApi.GetGame(id, token)
	if err != nil {
		c <- Result{
			Name: "",
			Err: fmt.Errorf("fetching game: %w", err),
		}
	}

	c <- Result{
		Name: game.Name,
		Err: nil,
	}
}
