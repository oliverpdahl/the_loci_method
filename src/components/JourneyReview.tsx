import React from 'react'
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
import { IconButton } from '@material-ui/core'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import Modal from '@material-ui/core/Modal'

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

function getSteps() {
  return ['Select campaign settings', 'Create an ad group', 'Create an ad']
}

function getStepContent(step: any) {
  switch (step) {
    case 0:
      return `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`
    case 1:
      return 'An ad group contains one or more ads which target a shared set of keywords.'
    case 2:
      return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`
    default:
      return 'Unknown step'
  }
}

export default function JourneyReview(props: any) {
  const classes = useStyles()
  const [activeStep, setActiveStep] = React.useState(0)
  const [openAddImageModal, setAddImageModal] = React.useState(false)
  const steps = getSteps()

  const journeyRef = firebase.database().ref('Journey')

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

  return (
    <div className={classes.root}>
      <Modal
        open={openAddImageModal}
        onClose={handleClose}
        style={{ width: '80%', position: 'fixed', top: '40%', left: '10%' }}
      >
        <Paper>
          <p>This is where form go</p>
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
