import { useState } from 'react'
import { Check, SquarePen, X } from 'lucide-react'
import './App.css'
import { PollItem } from './components/PollItem'

function App() {
  const [mainTitle, setMainTitle] = useState("Poll")
  const [polls, setPolls] = useState([
    { id: 0, title: 'Option 1'},
    { id: 1, title: 'Option 2'},
    { id: 2, title: 'Option 3'},
    { id: 3, title: 'Option 4'},
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editPolls, setEditPolls] = useState(polls)
  const [editMainTitle, setEditMainTitle] = useState(mainTitle)
  
  function handleEdit() {
    setEditPolls([...polls])
    setEditMainTitle(mainTitle)
    setIsEditing(true)
  }

  function handleSave() {
    setPolls([...editPolls])
    setMainTitle(editMainTitle)
    setIsEditing(false)
  }

  function handleCancel() {
    setEditPolls([...polls])
    setEditMainTitle(mainTitle)
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

        {isEditing ? (
          <input
            type="text"
            value={editMainTitle}
            onChange={(e) => setEditMainTitle(e.target.value)}
            className='main-title-input'
            placeholder='Enter poll title...'
          />
        ) : (
          <h2 className='main-title'>{mainTitle}</h2>
        )}

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
