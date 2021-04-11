import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import firebase from '../firebase'
import PostAddIcon from '@material-ui/icons/PostAdd'
import { IconButton, TextField } from '@material-ui/core'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import Modal from '@material-ui/core/Modal'
import formErrorMessages from '../utils/formErrorMessages'
import { useForm } from 'react-hook-form'
import 'rxjs/add/operator/map'

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
  }
}))

export default function JourneyReview(props: any) {
  const ImageListEmpty: Image[] = []

  const classes = useStyles()
  const [activeStep, setActiveStep] = React.useState(0)
  const [openAddImageModal, setAddImageModal] = React.useState(false)
  const { register, errors, handleSubmit, reset } = useForm<Image>()
  const [imagesList, setImagesList] = React.useState(ImageListEmpty.slice())

  const journeyRef = firebase.database().ref('Journey')
  const imageRef = firebase.database().ref('Image')

  type Image = {
    id: string
    order: number
    journeyID: string
    location: string
    description: string
    meaning: string
  }

  useEffect(() => {
    getImages()
  }, [])

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const handleCompleteReview = () => {
    setReviewedToNow(props.reviewID)
    props.setModal(false)
  }

  const setReviewedToNow = (id: string) => {
    const now = new Date().getTime()
    console.log(props.nextReview)
    journeyRef
      .child(id)
      .update({ reviewed: now, nextReview: now + props.nextReview })
  }

  const handleClose = () => {
    setAddImageModal(false)
  }

  const getImages = () => {
    imageRef
      .orderByChild('journeyID')
      .equalTo(props.reviewID)
      .on('value', snapshot => {
        const images = snapshot.val()
        let imagesList = ImageListEmpty.slice()
        for (let id in images) {
          imagesList[images[id].order] = { id, ...images[id] }
        }
        setImagesList(imagesList)
      })
  }

  const getSteps = () => {
    let list = []
    for (let i = 0; i < imagesList.length; i++) {
      list[imagesList[i].order] = imagesList[i].location
    }
    return list
  }

  const steps = getSteps()

  const getStepContent = (step: any) => {
    const description = imagesList[step].description
    const meaning = imagesList[step].meaning
    const message = 'Description: ' + description + ' Meaning: ' + meaning
    return message
  }

  return (
    <div className={classes.root}>
      <Modal
        open={openAddImageModal}
        onClose={handleClose}
        style={{ width: '80%', position: 'fixed', top: '40%', left: '10%' }}
      >
        <Paper>
          <form
            onSubmit={handleSubmit(vals => {
              //   vals.created = new Date().getTime()
              //   vals.reviewed = new Date().getTime()
              //   vals.nextReview = new Date().getTime() + 86400000
              vals.journeyID = props.reviewID
              vals.order = imagesList.length
              imageRef.push(vals)
              setAddImageModal(false)
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
      </Modal>
      <Stepper activeStep={activeStep} orientation='vertical'>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              {label}
              {/* <IconButton>
                    <PostAddIcon/>
                </IconButton> */}
              <IconButton>
                <ArrowUpwardIcon />
              </IconButton>
              <IconButton>
                <ArrowDownwardIcon />
              </IconButton>
              <IconButton>
                <EditIcon />
              </IconButton>
              <IconButton>
                <DeleteForeverIcon />
              </IconButton>
            </StepLabel>
            <StepContent>
              <Typography>{getStepContent(index)}</Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      <Button
        className={classes.button}
        onClick={() => {
          setAddImageModal(true)
        }}
      >
        Add New Image
      </Button>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} className={classes.button}>
            Reset
          </Button>
          <Button onClick={handleCompleteReview} className={classes.button}>
            Complete Review
          </Button>
        </Paper>
      )}
    </div>
  )
}
