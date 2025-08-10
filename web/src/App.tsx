import { useState } from 'react'
import { Check, Minus, Plus, SquarePen, X } from 'lucide-react'
import './App.css'
import { PollItem } from './components/PollItem'

function App() {
  const [mainTitle, setMainTitle] = useState("Poll Title")
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

  function addOption() {
    console.log(editPolls.length)
    if (editPolls.length >= 4) return;

    const newOption = {
      id: editPolls.length,
      title: `Option ${editPolls.length + 1}`
    }

    setEditPolls(prev => [...prev, newOption])
    setPolls(prev => [...prev, newOption])
  }

  function removeOption() {
    if (editPolls.length <= 2) return;

    setEditPolls(prev => prev.slice(0, -1))
    setPolls(prev => prev.slice(0, -1))
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
            <>
              <button onClick={handleEdit} className='control-btn'>
                <SquarePen size={16} />
                <span>Edit</span>
              </button>
              
              <button onClick={addOption} className='control-btn' disabled={editPolls.length >= 4}>
                <Plus size={16} />
                <span>Add</span>
              </button>
              
              <button onClick={removeOption} className='control-btn' disabled={editPolls.length <= 2}>
                <Minus size={16} />
                <span>Remove</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
