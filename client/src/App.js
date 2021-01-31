import './App.scss';
import { useState, useEffect } from 'react';
import Join from './components/Join/Join';
import Canvas from './components/Canvas/Canvas';
import queryString from 'query-string';

function App() {
  const [displayJoin, setDisplayJoin] = useState(false);
  const [displayCanvas, setDisplayCanvas] = useState(false);

  useEffect(() => {
    let queryStrings = queryString.parse(window.location.search);
    const { id, username } = queryStrings;

    if (id && username) {
      setDisplayCanvas(true);
      setDisplayJoin(false);
    } else {
      setDisplayJoin(true);
      setDisplayCanvas(false);
    }
  }, []);

  return (
    <div className='app'>
      {displayJoin && <Join />}
      {displayCanvas && <Canvas />}
    </div>
  );
}

export default App;
