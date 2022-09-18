import { FC } from "react";

const Title: FC<{text: string}> = (props) => {
  return (
    <h1 className="title">{props.text}</h1>
  );
}

export default Title;
