import React, {Component} from 'react';
import { TextField, SelectField, RaisedButton, DropDownMenu, MenuItem } from 'material-ui';

class CardAdder extends Component {
  constructor (props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleNewSelect = this.handleNewSelect.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.changeAnswerField = this.changeAnswerField.bind(this);
    this.addCurrentCard = this.addCurrentCard.bind(this);
    this.state = {
      newCardName: '',
      newCardType: 'white',
      newCardAnswerFields: 1
    };
  }

  handleKeyPress (e) {
    if (e.key === 'Enter') {
      this.addCurrentCard();
    }
  }

  handleNewSelect (e, index, newCardType) {
    this.setState({newCardType});
  }

  handleInputChange (property, e) {
    let stateChange = {};
    stateChange[property] = e.target.value;
    this.setState(stateChange);
  }

  changeAnswerField (event, index, value) {
    this.setState({newCardAnswerFields: value});
  }

  addCurrentCard () {
    if (this.state.newCardName) {
      this.props.addCards([{
        text: this.state.newCardName,
        type: this.state.newCardType,
        answerFields: this.state.newCardAnswerFields
      }]);
      this.setState({newCardName: ''});
    }
  }

  render () {
    return (
      <div className='panel'>
        <div className='col-narrow'>
          <TextField onKeyPress={this.handleKeyPress} floatingLabelText='Name' type='text' value={this.state.newCardName} onChange={this.handleInputChange.bind(this, 'newCardName')} />
          <RaisedButton label='Create Card' disabled={!this.state.newCardName} className='btn' onClick={this.addCurrentCard} />
        </div>
        <div className='col-wide'>
          <DropDownMenu value={this.state.newCardType} onChange={this.handleNewSelect}>
            <MenuItem value={'white'} primaryText='White' />
            <MenuItem value={'black'} primaryText='Black' />
          </DropDownMenu>
          {this.state.newCardType === 'black' ?
          <SelectField
            disabled={this.state.newCardType !== 'black'}
            floatingLabelText="Answer Fields"
            value={this.state.newCardAnswerFields}
            onChange={this.changeAnswerField}
          >
            <MenuItem value={1} primaryText="One" />
            <MenuItem value={2} primaryText="Two" />
            <MenuItem value={3} primaryText="Three" />
          </SelectField>
          : null}
        </div>
      </div>
    );
  }
}

module.exports = CardAdder;