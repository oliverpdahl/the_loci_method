import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Modal
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'
import RateReviewIcon from '@material-ui/icons/RateReview'
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
import { Edit } from '@material-ui/icons'
import EditForm from '../components/EditForm'
import JourneyReview from '../components/JourneyReview'

const Home = () => {
  const { register, errors, handleSubmit, reset } = useForm<Journey>()

  var JourneyListEmpty: Journey[] = []
  const [reviewedJourneyList, setReviewedJourneyList] = useState(
    JourneyListEmpty.slice()
  )
  const [toReviewJourneyList, setToReviewJourneyList] = useState(
    JourneyListEmpty.slice()
  )

  const [openEditModal, setOpenEditModal] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)
  const [journeyToEditID, setJourneyToEditID] = useState('')
  const [journeyToReviewID, setJourneyToReviewID] = useState('')
  const [journeyToReviewNextReview, setJourneyToReviewNextReview] = useState(0)
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
  }, [])

  const getJourneys = () => {
    const now = new Date().getTime()
    journeyRef
      // .orderByChild('uid')
      // .equalTo(firebase.auth().currentUser?.uid || '')
      .on('value', snapshot => {
        const journeys = snapshot.val()
        const reviewedList = JourneyListEmpty.slice()
        const toReviewList = JourneyListEmpty.slice()
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

  const handleJourneyDelete = (id: string) => {
    journeyRef.child(id).remove()
  }

  const createJourneyCard = (journey: Journey) => {
    return (
      <Card>
        <CardContent>
          <Typography color='textSecondary' gutterBottom>
            {journey.id}
          </Typography>
          <Typography variant='h5' component='h2'>
            {journey.title}
          </Typography>
          <Typography color='textSecondary'>{journey.location}</Typography>
          <Typography variant='body2' component='p'>
            Reviewed: {new Date(journey.reviewed).toString()}
            <br />
            Next Review: {new Date(journey.nextReview).toString()}
            <br />
            {'"a benevolent smile"'}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton
            aria-label='review'
            onClick={() => {
              setOpenReviewModal(true)
              setJourneyToReviewID(journey.id)
              const nextReview = (journey.nextReview - journey.reviewed) * 2
              setJourneyToReviewNextReview(nextReview)
            }}
          >
            <RateReviewIcon />
          </IconButton>
          <IconButton
            aria-label='edit'
            onClick={() => {
              setOpenEditModal(true)
              setJourneyToEditID(journey.id)
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label='delete'
            onClick={() => {
              handleJourneyDelete(journey.id)
            }}
          >
            <DeleteForeverIcon />
          </IconButton>
        </CardActions>
      </Card>
    )
  }

  const createJourneyCards = (journeyList: Journey[]) => {
    let list = []
    for (let i = 0; i < journeyList.length; i++) {
      list.push(createJourneyCard(journeyList[i]))
    }
    return <div>{list}</div>
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
      <Modal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false)
        }}
        style={{ width: '80%', position: 'fixed', top: '40%', left: '10%' }}
      >
        <EditForm editID={journeyToEditID} setModal={setOpenEditModal} />
      </Modal>
      <Modal
        open={openReviewModal}
        onClose={() => {
          setOpenReviewModal(false)
        }}
        style={{ width: '80%', position: 'fixed', top: '40%', left: '10%' }}
      >
        <Paper>
          <JourneyReview
            reviewID={journeyToReviewID}
            setModal={setOpenReviewModal}
            nextReview={journeyToReviewNextReview}
          />
        </Paper>
      </Modal>
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
            <AccordionDetails>
              {createJourneyCards(toReviewJourneyList)}
            </AccordionDetails>
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
                  vals.nextReview = new Date().getTime() + 86400000
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
            <AccordionDetails>
              {createJourneyCards(reviewedJourneyList)}
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Wrapper>
    </>
  )
}

export default Home
