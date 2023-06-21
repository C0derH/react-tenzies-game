import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {
                
    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [rollCount , setRollCount] = React.useState(0)
    const [time , setTime] = React.useState({
        seconds:0,
        minutes:0,
        hours:0
    })
    const [bestTime , setBestTime] = React.useState(
    JSON.parse(localStorage.getItem("bestTime"))
    ||
    {
        seconds:0,
        minutes:0,
        hours:0
    })
    
    
    
    function getTotalSeconds(obj){
        return obj.seconds + obj.minutes * 60 + obj.hours * 3600
    }
    
    React.useEffect(() => {
            if (tenzies) {
            const localStorageBestTime = JSON.parse(localStorage.getItem("bestTime"))
            const totalTime = getTotalSeconds(time)

            if (localStorageBestTime) {
                const totalLocalStorageTime = getTotalSeconds(localStorageBestTime)
                if (totalLocalStorageTime > totalTime) {
                localStorage.setItem("bestTime", JSON.stringify(time))
                setBestTime(time)
                }
            } else {
                localStorage.setItem("bestTime", JSON.stringify(time))
                setBestTime(time)
            }
        }
    }, [tenzies])
    
    React.useEffect(() => {
        let interval 
        if(!tenzies){
            interval = setInterval(() => {
                setTime(prevTime => {
                    if(prevTime.seconds !== 60){
                        return {
                            ...prevTime,
                            seconds : prevTime.seconds + 1
                        }
                    }else if(prevTime.minutes !== 60){
                        return {
                            ...prevTime,
                            seconds:0,
                            minutes: prevTime.minutes + 1
                        }
                    }else {
                        return {
                            ...prevTime,
                            seconds:0,
                            minutes:0,
                            hours : prevTime.hours + 1
                        }
                    }
                })
            },1000)
        }
        return () => {
                clearInterval(interval)
            }

    },[tenzies])
    

    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
        }
    }, [dice])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    

    
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            setRollCount(prevCount => prevCount + 1)
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        } else {
            setTenzies(false)
            setRollCount(0)
            setTime({
                seconds:0,
                minutes:0,
                hours:0
            })
            setDice(allNewDice())
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))


    function formatTheTime(timeObj){
        const { seconds, minutes, hours } = timeObj
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    return (
        <main>
            {tenzies && <Confetti />}
            <div className = "card-top">
                <p className = "roll-count">Rolls : {rollCount}</p>
                <h1 className="title">Tenzies</h1>
                <div>
                    <p className = "time">{formatTheTime(time)}</p>
                    <h4>Best Time</h4>
                    <p className = "time best-time">{formatTheTime(bestTime)}</p>
                </div>
            </div>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
        </main>
    )
}