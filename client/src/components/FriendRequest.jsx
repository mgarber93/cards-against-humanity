import React from 'react';
import axios from 'axios';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

class FriendRequest extends React.Component {
  constructor (props) {
    super(props);
    this.accept = this.accept.bind(this);
    this.remove = this.remove.bind(this);
  }

  accept () {
    axios.post('/api/friends', {
      type: 'accept',
      user: this.props.user.email
    });
  }

  remove () {
    axios.delete('/api/friends', {data: {user: this.props.user.email}});
  }

  render () {
    if (this.props.type === 'received') {
      return (
        <Card>
          <CardHeader
            title={this.props.user.firstname + ' ' + this.props.user.lastname}
            subtitle={this.props.user.email}
          />
          <CardActions>
            <FlatButton label='Accept' onClick={this.accept} />
            <FlatButton label='Decline' onClick={this.remove} />
          </CardActions>
        </Card>
      );
    } else if (this.props.type === "sent") {
      return (
        <Card>
          <CardHeader
            title={this.props.user.firstname + ' ' + this.props.user.lastname}
            subtitle={this.props.user.email}
          />
          <CardActions>
            <FlatButton label='Revoke' onClick={this.remove} />
          </CardActions>
        </Card>
      );
    }
  }
}

export default FriendRequest;