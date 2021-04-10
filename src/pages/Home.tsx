import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import routes from './routes'
import Wrapper from '../components/Wrapper'
import AppBar from '../components/AppBar'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import firebase from '../firebase'
import formErrorMessages from '../utils/formErrorMessages'
import { StringLiteral } from 'typescript'
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle'
import AddCircleIcon from '@material-ui/icons/AddCircle'

const Home = () => {
  const { register, errors, handleSubmit, reset } = useForm<Journey>()

  var JourneyListEmpty: Journey[] = []
  const [reviewedJourneyList, setReviewedJourneyList] = useState(
    JourneyListEmpty
  )
  const [toReviewJourneyList, setToReviewJourneyList] = useState(
    JourneyListEmpty
  )

  const journeyRef = firebase.database().ref('Journey')

  type Journey = {
    id: string
    uid: string
    title: string
    location: string
    created: number
    reviewed: number
    nextReview: number
  }

  useEffect(() => {
    getJourneys()
  })

  const getJourneys = () => {
    const now = new Date().getTime()
    journeyRef
      .orderByChild('uid')
      .equalTo(firebase.auth().currentUser?.uid || '')
      .on('value', snapshot => {
        const journeys = snapshot.val()
        const reviewedList = []
        const toReviewList = []
        for (let id in journeys) {
          if (now > journeys[id].nextReview) {
            toReviewList.push({ id, ...journeys[id] })
          } else {
            reviewedList.push({ id, ...journeys[id] })
          }
        }
        setToReviewJourneyList(toReviewList)
        setReviewedJourneyList(reviewedList)
      })
  }

  const currentUserString = () => {
    if (firebase.auth().currentUser) {
      return 'Welcome ' + firebase.auth().currentUser?.displayName
    }
  }

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
        <Typography paragraph>{currentUserString()}</Typography>
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
        <Paper>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownCircleIcon />}>
              Journeys to Review
            </AccordionSummary>
            <Divider />
            <AccordionDetails>{toReviewJourneyList}</AccordionDetails>
          </Accordion>
        </Paper>
        <p></p>
        <Paper>
          <Accordion>
            <AccordionSummary expandIcon={<AddCircleIcon />}>
              Create a Journey
            </AccordionSummary>
            <AccordionDetails>
              <form
                onSubmit={handleSubmit(vals => {
                  var user = firebase.auth().currentUser
                  if (user) {
                    vals.uid = firebase.auth().currentUser?.uid || ''
                  }
                  vals.created = new Date().getTime()
                  vals.reviewed = new Date().getTime()
                  vals.nextReview = new Date().getTime()
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
            </AccordionDetails>
          </Accordion>
        </Paper>
        <p></p>

        <Paper>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownCircleIcon />}>
              Journeys Not Up for Review
            </AccordionSummary>
            <Divider />
            <AccordionDetails>{reviewedJourneyList}</AccordionDetails>
          </Accordion>
        </Paper>
      </Wrapper>
    </>
  )
}

export default Home
