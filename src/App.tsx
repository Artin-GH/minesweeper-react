import { useState } from "react";
import "./App.css";
import Game from "./components/Game";
import Title from "./components/Title";

function App() {
  const [titleText, setTitleText] = useState("Good luck!");

  return (
    <div className="app">
      <Title text={titleText} />
      <Game
        onWin={() => setTitleText("You won! :)")}
        onLose={() => setTitleText("You lost! :(")}
      />
    </div>
  );
}

export default App;
