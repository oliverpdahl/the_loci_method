import React from 'react'
import { Paper, TextField, Button } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import firebase from '../firebase'
import formErrorMessages from '../utils/formErrorMessages'
import { makeStyles } from '@material-ui/core/styles'

const EditFormImage = (props: any) => {
  const { register, errors, handleSubmit, reset } = useForm()
  const imageRef = firebase.database().ref('Image')

  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%'
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    actionsContainer: {
      marginBottom: theme.spacing(2)
    },
    resetContainer: {
      padding: theme.spacing(3)
    },
    formContainer: {
      padding: theme.spacing(3)
    }
  }))

  const classes = useStyles()

  return (
    <Paper>
      <form
        className={classes.formContainer}
        onSubmit={handleSubmit(vals => {
          imageRef.child(props.editID).update(vals)
          props.setModal(false)
          reset()
        })}
      >
        <TextField
          label='Where is your image located in the mind palace?'
          name='location'
          variant='outlined'
          fullWidth
          inputRef={register({
            required: formErrorMessages.required
          })}
          error={!!errors.location}
          helperText={errors.location?.message || ' '}
        />
        <TextField
          label='What is the physical description of your image?'
          name='description'
          variant='outlined'
          fullWidth
          inputRef={register({
            required: formErrorMessages.required
          })}
          error={!!errors.description}
          helperText={errors.description?.message || ' '}
        />
        <TextField
          label='What does this image mean or represent?'
          name='meaning'
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

export default EditFormImage
