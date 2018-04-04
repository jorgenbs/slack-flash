/* global API_KEY */

import React from 'react';
import Router from 'next/router';
import Link from 'next/link';
import 'isomorphic-fetch';
import 'now-env';

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const API_KEY = process.env.SLACK_API;

const CHANNEL_ID = process.env.CHANNEL_ID;

const KEY_RIGHT = 39;
const KEY_UP = 38;

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      reveal: false
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown({ keyCode: key }) {
    if (key === KEY_RIGHT) this.next();
    else if (key === KEY_UP) this.setState({ reveal: true });
  }

  static async getInitialProps({ req }) {
    console.log('req', req);
    const channelRes = await fetch(
      `https://slack.com/api/channels.info?token=${API_KEY}&channel=${CHANNEL_ID}`
    );
    const memberRes = await fetch(
      `https://slack.com/api/users.list?token=${API_KEY}`
    );
    const { members } = await memberRes.json();
    const { channel } = await channelRes.json();

    if (members) {
      let filteredMembers = members
        .filter(m => channel.members.indexOf(m.id) >= 0)
        .map(member => {
          return {
            image:
              member.profile.image_original ||
              member.profile.image_1024 ||
              member.profile.image_512,
            name: member.profile.real_name_normalized
          };
        });
      filteredMembers = shuffle(filteredMembers);
      return { members: filteredMembers };
    } else {
      return { members: [] };
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   const { pathname, query } = nextProps.url;
  //   console.log('yo', pathname, query);
  //   // fetch data based on the new query
  // }

  next() {
    this.setState(prev => ({
      reveal: false,
      page: prev.page + 1
    }));
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}
      >
        <div>
          {this.props.members.map((m, i) => (
            <img
              key={i}
              style={{
                maxWidth: '400px',
                display: i === this.state.page ? 'block' : 'none'
              }}
              src={m.image}
            />
          ))}
        </div>
        <div>
          <p style={{ fontSize: '30px' }}>
            {this.state.reveal && this.props.members[this.state.page].name}
          </p>
        </div>
        <div>
          <p>
            Press{' '}
            <a href="#" onClick={() => this.setState({ reveal: true })}>
              UP
            </a>{' '}
            to reveal.{' '}
            <a href="#" onClick={() => this.next()}>
              RIGHT
            </a>{' '}
            to go next
          </p>
        </div>
        <div>
          <p>
            {this.state.page + 1}/{this.props.members.length}
          </p>
        </div>
        <br />
        <div>
          <a href="https://github.com/jorgenbs/slack-flash">
            make a Pull Request to my ugly code @github
          </a>
        </div>
      </div>
    );
  }
}
