import React from 'react'
import './App.css';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import YouTube from 'react-youtube';

//TODO: Fix websocket address
const client = new W3CWebSocket("ws://localhost:3000/");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.getVideo = this.getVideo.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.nextVideo = this.nextVideo.bind(this);
    this._onReady = this._onReady.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addURL = this.addURL.bind(this);
    this.removeVideo = this.removeVideo.bind(this);
    this.showQueue = this.showQueue.bind(this);
    this.state = {
      play: false,
      userid: '0000-0000-0000',
      video: '',
      videoId: '',
      player: null,
      queue: []
    }
  }

  componentDidMount() {
    client.onopen = () => {
      console.log('Client connected')
      this.getVideo();
    }
    client.onmessage = (message) => {
      let command = JSON.parse(message.data);
      let newState = this.state;
      switch(command.action) {
        case 'set-video':
          newState.videoId = command.videoId;
          break;
        case 'play-video':
          this.state.player.playVideo()
          console.log('play video')
          break;
        case 'pause-video':
          this.state.player.pauseVideo();
          console.log('pause video')
          break;
        case 'alert':
          console.log(command.message)
          break;
        case 'update-queue':
          newState.queue = command.queue
          break;
        default:
          console.log('i dont know what you want me to do???????')
      }
      this.setState(newState);
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
    let data = this.state.player.getVideoData()
    console.log(data)

    let message = {
      action: newState.play ? 'play' : 'pause',
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
  }

  handleChange(event) {
    let newState = this.state;
    newState[event.target.name] = event.target.value
    this.setState(newState);
  }

  addURL() {
    let message = {
      action: 'add-video',
      url: this.state.newURL,
      userid: this.state.userid
    }

    client.send(JSON.stringify(message))

    let newState = this.state;
    newState.newURL = ''
    this.setState(newState);

  }

  removeVideo(videoId) {
    let message = {
      action: 'remove-video',
      videoId: videoId,
      userid: this.state.userid
    }

    client.send(JSON.stringify(message))
  }

  showQueue() {
    return (
      <div>
        {this.state.queue.map((vid, index) => (
          <Card key={index} bg='dark' text='light' style={{margin: 10, width: 250}}>
            <Card.Title style={{padding: 10}}>{vid}<Button className='float-right' variant='outline-light' size='sm' onClick={() => this.removeVideo(vid)}>X</Button></Card.Title>
            <Card.Body>Put video things here</Card.Body>
          </Card>
        ))}
      </div>
    )
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
          <Container>
            <Form>
              <Form.Row>
                <Col>
                <Form.Label>YouTube URL</Form.Label>
                <Form.Control type='text' value={this.state.newURL} placeholder='Paste YouTube URL' name='newURL' onChange={this.handleChange}></Form.Control>
                <Button onClick={this.addURL}>Submit</Button>
                </Col>
              </Form.Row>
            </Form>
          </Container>
          
        </Col>
        <Col>
          {this.showQueue()}
        </Col>
      </Row>

    
      </div>
    );
  }
  
}

export default App;
