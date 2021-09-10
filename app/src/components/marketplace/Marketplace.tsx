import { observer } from "mobx-react-lite";
import { openSeaCollectionUrl } from "../../lib/constants";

function Marketplace() {
  return (
    <iframe
      src={`${openSeaCollectionUrl}/clipit?embed=true`}
      width="100%"
      height="100%"
      frameBorder="0"
      allowFullScreen
    ></iframe>
  );
}

export default observer(Marketplace);
