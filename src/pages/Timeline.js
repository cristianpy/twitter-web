import React, { Component } from 'react';
import socket from 'socket.io-client';

import api from '../Service/api';
import Tweet from '../components/Tweet';

import twitterLogo from '../twitter.svg';
import './Timeline.css';

export default class Timeline extends Component {
    state = {
        tweets: [],
        newTweet: '',
    };

    async componentDidMount() {
        this.subcribeToEvents();

        const response = await api.get('tweets');

        this.setState({ tweets: response.data });
    };

    subcribeToEvents = () => {
        const io = socket('http://localhost:3000');
        io.on('tweet', data => {
            let { tweets } = this.state;
            tweets = [data, ...tweets];
            this.setState({ tweets: tweets });
        });
        io.on('like', data => {
            let tweets = this.state.tweets.map(tweet => 
                tweet._id === data._id ? data : tweet
            );
            this.setState({ tweets: tweets });
        });
    };

    handleInputChangeNewTweet = e => {
        this.setState({ newTweet: e.target.value });
    };

    handleInputKeyDownNewTweet = async e => {
        if (e.keyCode !== 13) return;

        const author = localStorage.getItem('@GoTwitter:username');
        const content = this.state.newTweet;

        const tweet = {
            author: author,
            content: content
        };
        
        await api.post('tweets', tweet);

        this.setState({ newTweet: '' });
    };

    render() {
        return (
            <div className="timeline-wrapper">
                <img height={24} src={twitterLogo} alt="GoTwitter" />
                <form>
                    <textarea 
                        value={this.state.newTweet}
                        onChange={this.handleInputChangeNewTweet}
                        onKeyDown={this.handleInputKeyDownNewTweet}
                        placeholder="¿Que está pasando?"
                    />
                </form>
                <ul className="tweet-list">
                    {
                        this.state.tweets.map((tweet, index) => {
                            return (
                                <Tweet
                                    key={index}
                                    tweet={tweet}
                                />
                            )
                        })
                    }
                </ul>
            </div>
        );
    }
}
