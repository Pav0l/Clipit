import { CardMedia } from "@material-ui/core";

interface Props {
  src: string;
  className: string;
  title?: string;
}

export function TwitchEmbed(props: Props) {
  return (
    <CardMedia
      component="iframe"
      frameBorder="0"
      scrolling="no"
      allowFullScreen={false}
      height="100%"
      width="100%"
      src={props.src}
      title={props.title ?? "twitch clip embedded in iframe"}
      className={props.className}
    />
  );
}
