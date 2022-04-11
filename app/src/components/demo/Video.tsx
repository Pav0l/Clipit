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

    // <CardMedia
    //   component="iframe"
    //   frameBorder="0"
    //   scrolling="no"
    //   allowFullScreen={false}
    //   height="100%"
    //   width="100%"
    //   src={`https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW&parent=${window.location.hostname}`}
    //   title={"Twitch clip embedded in iframe"}
    //   className={props.className}
    // />
  );
}
