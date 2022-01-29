package signer

import (
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"

	"github.com/ethereum/go-ethereum/crypto"
)


type Signer struct {
	pk *ecdsa.PrivateKey
}

func NewSigner(privateKey string) *Signer {
	pk, err := crypto.HexToECDSA(privateKey)
	if err != nil {
		panic(err)
	}

	return &Signer{
		pk: pk,
	}
}

// Sign generates a message signature which can be verified in Solidity contract via `ecrecover`
// The message is keccak256 hashed, then prefixed with `\x19Ethereum Signed Message:\n%d%s", len(msgHash)` and 
// keccak256 hashed again before being signed by Signers private key.
// NOTE: The recovery identifier of edcsa signature (v) has added `27` to it for legacy Bitcoin/Ethereum reasons
func (s *Signer) Sign(msg []byte) (Signature, error) {
	msgHash := crypto.Keccak256(msg)
	ethSignedMsg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(msgHash), string(msgHash))

	hash := crypto.Keccak256([]byte(ethSignedMsg))
	
	signature, err := crypto.Sign(hash, s.pk)
	if err != nil {
		return Signature{}, fmt.Errorf("signing message hash err: %w", err)
	}

	return Signature{
		R: "0x" + hex.EncodeToString(signature[:32]),
		S: "0x" + hex.EncodeToString(signature[32:64]),
		V: handleEthereumRecoveryIdenifier(uint8(signature[64])),
	}, nil
}

type Signature struct {
	R string `json:"r"`
	S string `json:"s"`
	V uint8	`json:"v"`
}

// handleEthereumRecoveryIdenifier adds 27 to ecdsa recovery indicator (v)
func handleEthereumRecoveryIdenifier(v uint8) uint8 {
	/*
	The recovery identifier is either 0 or 1, but for some legacy reasons we add 27 to it
	See:
	- Appendix F. of Ethereum Yellow Paper: https://ethereum.github.io/yellowpaper/paper.pdf
	- https://github.com/ethereum/go-ethereum/issues/19751#issuecomment-504900739
	*/
	return v + 27
}
