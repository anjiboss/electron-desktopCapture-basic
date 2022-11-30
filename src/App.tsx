import { desktopCapturer } from "electron";
import React, { useEffect, useRef, useState } from "react";
import "style/App.css";
import { ipcRenderer } from "electron";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [sources, setSources] = useState<Electron.DesktopCapturerSource[]>([]);

  useEffect(() => {
    ipcRenderer.on("GET_SOURCES", (e, content) => {
      console.log("Have Event", { e, content });
      setSources(content);
    });
    if (videoRef.current) {
      ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
        console.log(event);
        try {
          navigator.mediaDevices
            .getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: sourceId,
                  minWidth: 1280,
                  maxWidth: 1280,
                  minHeight: 720,
                  maxHeight: 720,
                },
              },
            })
            .then((stream) => {
              handleStream(stream, videoRef.current!);
            });
        } catch (e) {
          handleError(e);
        }
      });
    }
  }, [videoRef.current]);

  function handleStream(stream: MediaStream, video: HTMLVideoElement) {
    video.srcObject = stream;
    video.onloadedmetadata = (e) => video.play();
  }

  function handleError(e: any) {
    console.log(e);
  }

  const changeSource = (source: Electron.DesktopCapturerSource) => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: source.id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720,
          },
        },
      })
      .then((stream) => {
        handleStream(stream, videoRef.current!);
      });
  };

  return (
    <div className="App">
      <video ref={videoRef} autoPlay></video>
      {sources.map((source) => {
        return (
          <button onClick={() => changeSource(source)}>{source.name}</button>
        );
      })}
    </div>
  );
};

export default App;
