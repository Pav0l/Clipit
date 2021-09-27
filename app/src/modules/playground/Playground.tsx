import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { clipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import { twitchOauthClient } from "../../lib/twitch-oauth/twitch-oauth-api.client";
import { getAccessToken } from "../../lib/twitch-oauth/twitch-oauth.utils";
import { useStore } from "../../store/StoreProvider";

import { NftService } from "../../domains/nfts/nft.service";

import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { snackbarClient } from "../snackbar/snackbar.client";
import ErrorWithRetry from "../error/Error";
import FullPageLoader from "../../components/loader/FullPageLoader";

const embeds = [
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`,
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`,
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`,
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`,
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`,
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`,
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`,
  `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${encodeURIComponent(
    "localhost"
  )}`
];

const Playground = observer(function Playground() {
  const { testStore, nftStore } = useStore();
  const nftService = new NftService(nftStore);

  const validateToken = () => {
    twitchOauthClient.validateAccessToken(getAccessToken() ?? "");
  };

  const str = (val: any) => {
    return JSON.stringify(val);
  };

  const mint = async () => {
    const ethClient = nftService.initializeEthereumClient(
      window.ethereum as EthereumProvider
    );

    if (!ethClient) {
      console.log("PLAYGROUND MINT NO ETH CLIENT");
      return;
    }

    await nftService.mintNFT(ethClient.signer, {
      metadataCid:
        "bafybeige7pfjo5v5cvgaydaqraej3375ef2h4x5vyjieckq464sxyz34nm",
      clipId: "StylishRudeMetalJonCarnage-bdc8E8x73fMBrT6o",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    });
  };

  useEffect(() => {
    console.log("isArr.length hook triggered", testStore.isArr);
  }, [testStore.isArr.length]);

  useEffect(() => {
    console.log("isArr hook triggered", testStore.isArr);
  }, [testStore.isArr]);

  useEffect(() => {
    console.log("obj count triggered", testStore.isObj.count);
  }, [testStore.isObj.count]);

  // return <FullPageLoader />;

  // return (
  //   <ErrorWithRetry
  //     text={"This is some pretty ok error message, what you do?"}
  //   ></ErrorWithRetry>
  // );

  return (
    <div>
      <div>ETHEREUM</div>
      <div>isBool: {str(testStore.isBool)}</div>
      <button onClick={() => testStore.setBool(!testStore.isBool)}>
        change isBool
      </button>
      <button onClick={() => mint()}>mint</button>

      <div>Snackbar</div>
      <button
        onClick={() => snackbarClient.sendSuccess(`happy: ${Math.random()}`)}
      >
        SUCCESS
      </button>
      <button onClick={() => snackbarClient.sendError(`sad: ${Math.random()}`)}>
        ERROR
      </button>

      {/* <div>isNum: {str(testStore.isNum)}</div>
      <button onClick={() => testStore.setNum(testStore.isNum + 1)}>
        change isNum
      </button>

      <div>iisString {str(testStore.isString)}</div>
      <button onClick={() => testStore.setString(testStore.isString + "kek")}>
        change iisString
      </button>

      <div>isObj: {str(testStore.isObj)}</div>
      <button onClick={() => testStore.setObj(testStore.isString)}>
        change isObj
      </button>

      <div>setObj count: {str(testStore.isObj.count)}</div>
      <button onClick={() => testStore.setCount()}>change count</button>

      <div>isArr: {str(testStore.isArr)}</div>
      <button onClick={() => testStore.appendClass(testStore.isString)}>
        appendClass to Arr
      </button>

      <div>isArr: {str(testStore.isArr)}</div>
      <button onClick={() => testStore.appendArr(testStore.isString)}>
        append string to Arr
      </button>
      <button onClick={() => testStore.replaceArr(["one", "two"])}>
        replace 2 to arr
      </button>
      <button onClick={() => testStore.replaceArr(["one", "two", "three"])}>
        replace 3 to arr
      </button>

      <div>isClass: {str(testStore.isClass.attr)}</div>
      <button onClick={() => testStore.changeClass("new attr")}>
        change attr
      </button>
      <button onClick={() => testStore.setClass("new class")}>
        change class
      </button>

      <div>VALIDATE TOKEN</div>
      <button onClick={validateToken}>validate</button> */}
      {/* <div>EMBEDS:</div>
      <div>
        {embeds.map((url, idx) => {
          return (
            <iframe
              src={url}
              height="<height>"
              width="<width>"
              // allowfullscreen="<allow full screen>"
              key={idx}
            ></iframe>
          );
        })}
      </div> */}
    </div>
  );

  // return <div>What is this about?</div>;
});

export default Playground;
