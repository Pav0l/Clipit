// import { Box, CircularProgress } from "@material-ui/core";
// import { observer } from "mobx-react-lite";
// import { useStore } from "../../store/StoreProvider";
// import { useAddressClips } from "../../hooks/useAddressClips";
// import { ClipCard } from "../clipCard/ClipCard";

// // TODO refactor
// function Nfts() {
//   const { nftStore } = useStore();

//   useAddressClips(nftStore);

//   if (nftStore.meta.isLoading) {
//     return (
//       <Box className="clips-container with-center-content">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (nftStore.nfts.length > 0) {
//     return (
//       <Box className="clips-container">
//         {nftStore.nfts.map((clip) => {
//           // return <ClipCard cid={clip.cid} key={clip.cid} />;
//           return <div>{JSON.stringify(clip)}</div>;
//         })}
//       </Box>
//     );
//   }

//   if (nftStore.nfts.length === 0) {
//     return (
//       <Box className="clips-container with-center-content">
//         <div>There are no CLIPs in your wallet</div>
//       </Box>
//     );
//   }

//   return (
//     <Box className="clips-container with-center-content">
//       <CircularProgress />
//     </Box>
//   );
// }

// export default observer(Nfts);
export {};
