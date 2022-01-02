import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  CardContent,
  Button,
  makeStyles,
  TextField,
  InputAdornment
} from "@material-ui/core";

import type { useInputReturn } from "../../lib/hooks/useInputData";

interface Props {
  mint: () => Promise<void>;
  validateCreatorShare: (value: string) => boolean;

  titleInputHook: useInputReturn;
  descInputHook: useInputReturn;
  shareInputHook: useInputReturn;
}

const defHelperShareMsg =
  "Percentage of all future sales you'll receive as a creator";
const defTitleMsg = "Title";

function ClipCardContent({
  validateCreatorShare,
  mint,
  titleInputHook,
  descInputHook,
  shareInputHook
}: Props) {
  const [isDisabled, setDisabled] = useState(false);

  const [titleInput, setTitleInput, clearTitleInput] = titleInputHook;
  const [isTitleErr, setTitleErr] = useState(false);
  const [titleLabel, setTitleLabel] = useState(defTitleMsg);

  const [descriptionInput, setDescInput, clearDescInput] = descInputHook;

  const [creatorShare, setShareInput, clearShareInput] = shareInputHook;
  const [isShareErr, setShareErr] = useState(false);
  const [helperShareMsg, setHelperShareMsg] = useState(defHelperShareMsg);

  const classes = useStyles();

  const handleShareChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!validateCreatorShare(ev.target.value)) {
      setShareErr(true);
      setHelperShareMsg("The value must be an integer between 0-99");
      setDisabled(true);
    } else {
      setShareInput(ev.target.value);
      setShareErr(false);
      setHelperShareMsg(defHelperShareMsg);
      setDisabled(false);
    }
  };

  const handleTitle = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (ev.target.value.length > 100) {
      setDisabled(true);
      setTitleErr(true);
      setTitleLabel("Title can not be more than 100 characters long");
      return;
    }

    setTitleInput(ev.target.value);

    if (ev.target.value.length === 0) {
      setDisabled(true);
      setTitleLabel("Title can not be empty");
      setTitleErr(true);
      return;
    }

    setTitleErr(false);
    setDisabled(false);
    setTitleLabel(defTitleMsg);
  };

  const handleMint = async () => {
    setDisabled(true);

    await mint();

    setTitleLabel(defTitleMsg);
    setTitleErr(false);
    clearTitleInput();

    clearDescInput();

    setHelperShareMsg(defHelperShareMsg);
    setShareErr(false);
    clearShareInput();

    setDisabled(false);
  };

  return (
    <CardContent className={classes.content}>
      <div className={classes.form}>
        <TextField
          label={titleLabel}
          id="clip-title"
          value={titleInput}
          size="small"
          onChange={handleTitle}
          required
          error={isTitleErr}
          variant="outlined"
        />

        <TextField
          label="Description"
          id="clip-description"
          value={descriptionInput}
          size="small"
          onChange={setDescInput}
          className={classes.input}
          multiline
          rows={3}
          variant="outlined"
        />

        <TextField
          label="Creator share"
          id="creator-share"
          value={creatorShare}
          size="small"
          onChange={handleShareChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">%</InputAdornment>
          }}
          helperText={helperShareMsg}
          error={isShareErr}
          variant="outlined"
        />
      </div>
      <Button
        size="medium"
        color="primary"
        variant="contained"
        disabled={isDisabled}
        onClick={handleMint}
        className={classes.button}
      >
        {/* Mint / Create NFT */}
        Publish
      </Button>
    </CardContent>
  );
}

export default observer(ClipCardContent);

const useStyles = makeStyles(() => ({
  content: {
    display: "flex",
    flexDirection: "column"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minWidth: "80%"
  },
  input: {
    margin: "1rem 0"
  },
  button: {
    alignSelf: "flex-end"
  }
}));
