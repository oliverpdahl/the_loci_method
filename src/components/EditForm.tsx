import React from 'react'
import { Paper, TextField, Button } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import firebase from '../firebase'
import formErrorMessages from '../utils/formErrorMessages'

const EditForm = (props: any) => {
  const { register, errors, handleSubmit, reset } = useForm()
  const journeyRef = firebase.database().ref('Journey')
  return (
    <Paper>
      <form
        onSubmit={handleSubmit(vals => {
          journeyRef.child(props.editID).update(vals)
          props.setModal(false)
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
          error={!!errors.title}
          helperText={errors.title?.message || ' '}
        />
        <TextField
          label='What is the location of the mind palace for your journey?'
          name='location'
          variant='outlined'
          fullWidth
          inputRef={register({
            required: formErrorMessages.required
          })}
          error={!!errors.location}
          helperText={errors.location?.message || ' '}
        />
        <Button type='submit' color='primary'>
          Submit
        </Button>
      </form>
    </Paper>
  )
}

export default EditForm
