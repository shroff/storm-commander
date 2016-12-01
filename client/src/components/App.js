import 'whatwg-fetch'
import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null
    };
  }
  
  componentDidMount() {
    fetch('api/device_list')
      .then((response) => {
        return response.json()
      }).then((jsonText) => {
        this.setState({
          loading: false,
          data: jsonText
        })
      })
  }

  render() {
    let data = this.state.loading ? "Loading..." : JSON.stringify(this.state.data)
    return (
      <div className="App">
        <h1>Hello App!</h1>
        <pre>{data}</pre>
      </div>
    )
  }
}

export default App;
