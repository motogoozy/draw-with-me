import './App.scss';
import { useState, useEffect } from 'react';
import Join from './components/Join/Join';
import Canvas from './components/Canvas/Canvas';
import InfoTab from './components/InfoTab/InfoTab';
import queryString from 'query-string';

function App() {
  const [displayJoin, setDisplayJoin] = useState(false);
  const [displayCanvas, setDisplayCanvas] = useState(false);
  const [showInfoTab, setShowInfoTab] = useState(false);

  const handleColorChange = event => {
    console.log(event.hex);
  };

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
      {displayCanvas && (
        <>
          <Canvas />
          <InfoTab showInfoTab={showInfoTab} setShowInfoTab={setShowInfoTab} handleColorChange={handleColorChange} />
        </>
      )}
    </div>
  );
}

export default App;
