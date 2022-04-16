import { CardMedia } from "@material-ui/core";

interface Props {
  src: string;
  className: string;
  title?: string;
}

export function TwitchEmbed(props: Props) {
  const src = new URL(props.src);
  src.searchParams.append("parent", window.location.hostname);

  return (
    <CardMedia
      component="iframe"
      frameBorder="0"
      scrolling="no"
      allowFullScreen={false}
      height="100%"
      width="100%"
      src={src.href}
      title={props.title ?? "twitch clip embedded in iframe"}
      className={props.className}
    />
  );
}
