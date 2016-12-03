import 'whatwg-fetch'
import React, { Component } from 'react';
import DeviceList from './DeviceList.js';
import '../css/App.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null,
      error: null
    };
  }
  
  componentDidMount() {
    fetch('api/device_list')
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.statusText);
          error.staus = response.status;
          error.response = response;
          throw error;
        }
        return response.json()
      }).then((jsonText) => {
        this.setState({
          loading: false,
          data: jsonText,
          error: null
        })
      }).catch((err) => {
        this.setState({
          loading: false,
          data: null,
          error: err
        });
      });
  }

  render() {
    let data = this.state.loading ? "Loading..." : this.state.error
      ? <pre>{JSON.stringify(this.state.error)}</pre>
      : <DeviceList devices={this.state.data} />
    return (
      <div className="App">
        {data}
      </div>
    )
  }
}

export default App;
