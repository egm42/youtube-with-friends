import React from 'react'
import './App.css';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import YouTube from 'react-youtube';

const client = new W3CWebSocket("ws://localhost:3333");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.getVideo = this.getVideo.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.nextVideo = this.nextVideo.bind(this);
    this._onReady = this._onReady.bind(this);
    this.state = {
      play: false,
      userid: '0000-0000-0000',
      video: '',
      videoId: '',
      player: null
    }
  }

  componentDidMount() {
    client.onopen = () => {
      console.log('Client connected')
      this.getVideo();
    }
    client.onmessage = (message) => {
      let command = JSON.parse(message.data);
      switch(command.action) {
        case 'set-video':
          let newState = this.state;
          newState.video = command.video;
          newState.videoId = command.videoId;
          this.setState(newState);
          break;
        case 'play-video':
          this.state.player.playVideo()
          console.log('play video')
          break;
        case 'pause-video':
          this.state.player.pauseVideo();
          console.log('pause video')
          break;
        default:
          console.log('i dont know what you want me to do???????')
      }
    }
  }

  getVideo() {
    let message = {
      action: 'get-video',
      userid: this.state.userid
    }

    client.send(JSON.stringify(message))
  }

  togglePlay() {
    let newState = this.state;
    newState.play = !newState.play;
    this.setState(newState);

    let message = {
      action: !newState.play ? 'play' : 'pause',
      userid: this.state.userid
    }

    client.send(JSON.stringify(message))
  }

  nextVideo() {
    let message = {
      action: 'next',
      userid: this.state.userid
    }

    client.send(JSON.stringify(message))
  }

  _onReady(event) {
    let newState = this.state;
    newState.player = event.target;
    this.setState(newState);
    console.log(event.target)
    console.log(event.target)
  }

  render() {
    return (
      <div className="App">
      <Row>
        <Col>
          <Container>
            <YouTube videoId={this.state.videoId} onReady={this._onReady}/>
            {/* <iframe width="560" height="315" src={this.state.video} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> */}
          </Container>
          <Button onClick={this.togglePlay}>{!this.state.play?'play':'pause'}</Button>
          <Button onClick={this.nextVideo}>next</Button>
        </Col>
        <Col>
          <p>this is where queue goes</p>
        </Col>
      </Row>
    
      </div>
    );
  }
  
}

export default App;
