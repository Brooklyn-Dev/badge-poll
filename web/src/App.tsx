import { useState } from 'react'
import { Check, SquarePen, X } from 'lucide-react'
import './App.css'
import { PollItem } from './components/PollItem'

function App() {
  const [polls, setPolls] = useState([
    { id: 0, title: 'Question 1'},
    { id: 1, title: 'Question 2'},
    { id: 2, title: 'Question 3'},
    { id: 3, title: 'Question 4'},
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editPolls, setEditPolls] = useState(polls)
  
  function handleEdit() {
    setEditPolls([...polls])
    setIsEditing(true)
  }

  function handleSave() {
    setPolls([...editPolls])
    setIsEditing(false)
  }

  function handleCancel() {
    setEditPolls([...polls])
    setIsEditing(false)
  }

  function handleTitleChange(id: number, newTitle: string) {
    setEditPolls(prev => prev.map(poll =>
      poll.id === id ? { ...poll, title: newTitle } : poll
    ))
  }

  const currentPolls = isEditing ? editPolls : polls;

  return (
    <>
      <div className='app-container'>
        <h1>Badge Poll</h1>

        <div className='poll-items'>
          {currentPolls.map((poll) =>
            <PollItem 
              key={poll.id}
              index={poll.id}
              title={poll.title}
              isEditing={isEditing}
              onTitleChange={(newTitle) => handleTitleChange(poll.id, newTitle)}
            />
          )}
        </div>

        <div className='poll-controls'>
          {isEditing ? (
            <>
              <button onClick={handleSave} className='control-btn'>
                <Check size={16} />
                <span>Save</span>
              </button>
              <button onClick={handleCancel} className='control-btn'>
                <X size={16} />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className='control-btn'>
              <SquarePen size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default App
