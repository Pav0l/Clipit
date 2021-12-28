import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import FullPageLoader from "../../../components/loader/FullPageLoader";

interface Props {
  referrer?: string;
}

const OAuth2Redirect = observer(({ referrer }: Props) => {
  const history = useHistory();

  useEffect(() => {
    if (!referrer) {
      referrer = "/";
    }
    history.push(referrer);
  }, []);

  return <FullPageLoader />;
});

export default OAuth2Redirect;
