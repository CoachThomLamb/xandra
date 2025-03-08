import App from './App'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Simple working test', () => {
    it('the app renders', () => {
        render(<App />)
        expect(screen.getByText(" Trainers create workouts.")).toBeInTheDocument()
})

 
})
