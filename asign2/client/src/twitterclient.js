import React, { useState } from 'react';
import './twitterclient.css';

/*
    retieves the data from the server endpoint
*/
export function getTweets(hashtag) {

    return fetch(`/search/tweets/${hashtag}`)
    .then((response) => response.json())
    .then((data) => { 
        console.log(data);
        return data})
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
        console.log(tweets.length)
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
        </div>
    )
}