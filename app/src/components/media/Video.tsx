import { CardMedia } from "@material-ui/core";

interface Props {
  src: string;
  className: string;
  title?: string;
}

export function Video(props: Props) {
  return (
    <CardMedia
      component="video"
      src={props.src}
      title={props.title ?? "demo clip"}
      className={props.className}
      controls
      controlsList="nodownload"
    />
  );
}
