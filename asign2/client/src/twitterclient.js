import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import './twitterclient.css';

/*
    retieves the data from the server endpoint
*/
export function getTweets(hashtag) {

    return fetch(`/search/tweets/${hashtag}`)
    .then((response) => response.json())
    .then((data) => { 
        console.log(data);
        return data.results})
    .then((rsp) => 
    rsp.map((twt) => ({
        id: twt.author,
        text: twt.tweet,
        analysis: twt.analysis
    })),
    )
    .catch((e) => {console.log(e)});
}

/* 
    Creates table to display data to user
*/
function createTable(tweets) {
    
    if(tweets.length !== 1 && tweets.length !== 0)  {
        return (
            <div>
                <table className = "DataTable">
                    <tr className = "Headers">
                        <td> Tweet By</td>
                        <td> Tweet </td>
                        <td> Tweet Analysis </td>
                    </tr>
                    { tweets.map((data) => {
                        return(
                            <tr>
                                <td>{data.id}</td>
                                <td>{data.text}</td>
                                <td>{data.analysis}</td>
                            </tr>
                        )
                    })
                    }
                </table>
            </div>
        )     
    }
}

/*
    This Function creates the sentimental analysis graph
*/
function createGraph(tweets) {

    if (tweets.length !== 1 && tweets.length !== 0) {
        var pos = 0;
        var neg = 0;
        var neu = 0;
        var total = tweets.length;
        for (var i = 0; i < tweets.length; i++) {
            if (tweets[i].analysis == "positive") {
                pos++;
            } else if (tweets[i].analysis == "negative") {
                neg++;
            } else if (tweets[i].analysis == "neutral") {
                neu++;
            }
        }
        pos = (pos / total * 100).toFixed(3);
        neg = (neg / total * 100).toFixed(3);
        neu = (neu / total * 100).toFixed(3);
        var data = {
            labels: ['positive', 'negative', 'neutral'],
            datasets: [{
                label: `% of Tweets`,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
                data: [pos, neg, neu],
            }],
        }

        var options = {
            plugins: {
                title: {
                    display: true,
                    text: `Analysis Distribution of ${total} Tweets`,
                    font: {
                        weight: 'bold',
                        font: 100
                    }
                }
            },
            scales: {
                y: {
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + "%"
                        }
                    }

                }
            }
        }

        return (
            <div>
                <Bar data={data} width={100} height={50} options={options} />
            </div>
        )
    }
}

export default function TwitterRoute() {

    // Initialise Variables
    const [hashtag, setHashtag] = useState("");
    const [htmlhashtag, setHtmlhashtag] = useState("");
    const [tweetdata, setTweetdata] = useState([{id: "", text: "", analysis: ""}])
    const [error, setError] = useState("");

    return(
        <div>
            <h1> Twitter Hashtag Search </h1>
            <h3>{error}</h3>
            <p> Search for tweets by hashtags. For mutliple
                tags, use a space between tags
            </p>
            <p> Example: <i>#dog #cat #cute</i></p>
            <div className = "SearchBox">
            <label> Search: 
                <input 
                    className = "TextBox"
                    type="text" 
                    id = "hashtag"
                    value = {hashtag}
                    placeholder = "Input search tag"
                    onChange = { (e) => {
                        const { value } = e.target;
                        setHashtag(value);
                        setHtmlhashtag(encodeURIComponent(value))
                    }}
                />
            </label>
            <button 
            onClick = {() => {
                if (hashtag === "") {
                    setError("Please enter a tag");
                }
                else {
                    setError("");
                    getTweets(htmlhashtag)
                    .then((rsp) => {
                        setTweetdata(rsp);
                        console.log(rsp);
                        console.log(tweetdata);
                        if (rsp.length === 0) {
                            setError("No found tweets with tag/s searched. Try reducing or another tag!");
                        }
                        else {
                            setError("");
                        }
                    })   
                }
            }}> Submit </button>
            </div>
            {createTable(tweetdata)}
            {createGraph(tweetdata)}
        </div>
    )
}