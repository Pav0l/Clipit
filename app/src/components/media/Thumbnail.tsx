import { CardMedia } from "@material-ui/core";

interface Props {
  src: string;
  className: string;
  title?: string;
}

export function Thumbnail(props: Props) {
  return (
    <CardMedia
      component="img"
      src={props.src}
      title={props.title ?? "clip thumbnail"}
      className={props.className}
      alt="clip thumbnail"
    />
  );
}
