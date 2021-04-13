import React from 'react'
import { Paper, TextField, Button } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import firebase from '../firebase'
import formErrorMessages from '../utils/formErrorMessages'
import { makeStyles } from '@material-ui/core/styles'

const EditForm = (props: any) => {
  const { register, errors, handleSubmit, reset } = useForm()
  const journeyRef = firebase.database().ref('Journey')

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
        <TextField
          label='Is there an image of the building or floorplan you would like to use? (Optional)'
          name='image'
          variant='outlined'
          fullWidth
          inputRef={register({
            required: false
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
