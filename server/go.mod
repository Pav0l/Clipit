module github.com/clip-it/server

go 1.16

replace github.com/xClipIt/server => ./../../..

require (
	github.com/btcsuite/btcd v0.22.0-beta // indirect
	github.com/ethereum/go-ethereum v1.10.8
	github.com/joho/godotenv v1.4.0
	github.com/julienschmidt/httprouter v1.3.0
	golang.org/x/crypto v0.0.0-20210915214749-c084706c2272 // indirect
	golang.org/x/sys v0.0.0-20210917161153-d61c044b1678 // indirect
)
