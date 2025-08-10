import { Circle, Triangle, Diamond, Square } from 'lucide-react'

const icons = [Circle, Triangle, Diamond, Square]
const colours = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e']

interface PollItemProps {
    index: number
    title: string
    isEditing: boolean
    onTitleChange: (newTitle: string) => void
}

export function PollItem({ index, title, isEditing, onTitleChange }: PollItemProps) {
    const IconComponent = icons[index]
    const colour = colours[index]

    return <div className='poll-item'>
        <IconComponent
            className='poll-item__icon'
            strokeWidth={1}
            color={colour}
            fill={colour}
            size={32}
        />

        {isEditing ? (
            <input 
                type='text'
                value={title}
                onChange={(e) => onTitleChange?.(e.target.value)}
                className='poll-item__input'
                placeholder='Enter title...'
            />
        ) : (
            <h3 className='poll-item__header'>{title}</h3>
        )}
    </div>
}