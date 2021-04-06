import { Box, Typography, TextField, Button } from '@material-ui/core'
import { Link } from 'react-router-dom'
import routes from './routes'
import Wrapper from '../components/Wrapper'
import AppBar from '../components/AppBar'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import firebase from '../firebase'
import formErrorMessages from '../utils/formErrorMessages'

const Home = () => {
  const { register, errors, handleSubmit, reset } = useForm<{ name: string }>()
  const [title, setTitle] = useState('')
  const journeyRef = firebase.database().ref('Journey')

  var user = firebase.auth().currentUser

  return (
    <>
      <AppBar
        title='The Loci Method'
        actions={
          <Button
            color='primary'
            size='small'
            component={Link}
            to={routes.signin}
            variant='contained'
          >
            Sign In or Sign Up
          </Button>
        }
      />

      <Wrapper>
        <Typography paragraph variant='h3'>
          Create Mind Palaces to Remember Like Never Before
        </Typography>
        <Typography paragraph variant='h6'>
          An ideal mind palace is a brightly lit deserted place with a standard
          rout through it like a museum or school after hours and is filled with
          striking images of people doing an action to encode information with a
          key transition at every fifth image
        </Typography>
        <Typography paragraph>
          Key Vocabulary:
          <br />
          Image - The visual representation of what you are trying to remember
          <br />
          Mind Palace - The visualization or a real or imaginary place where you
          store images
          <br />
          Journey - The mental walk you take through the images you have
          collected in the mind palace
        </Typography>
        <Typography paragraph variant='h5'>
          Create a Journey
        </Typography>

        <form
          onSubmit={handleSubmit(vals => {
            if (user) {
              vals.push({
                key: 'userID',
                value: firebase.auth().currentUser?.uid
              })
            }
            journeyRef.push(vals)
            reset()
          })}
        >
          <TextField
            label='Enter the title of your journey (what are you looking to remember?)'
            name='title'
            variant='outlined'
            fullWidth
            inputRef={register({
              required: formErrorMessages.required
            })}
            error={!!errors.name}
            helperText={errors.name?.message || ' '}
          />
          <TextField
            label='What is the location of the mind palace for your journey?'
            name='location'
            variant='outlined'
            fullWidth
            inputRef={register({
              required: formErrorMessages.required
            })}
            error={!!errors.name}
            helperText={errors.name?.message || ' '}
          />
          <Button type='submit' color='primary'>
            Submit
          </Button>
        </form>
      </Wrapper>
    </>
  )
}

export default Home
