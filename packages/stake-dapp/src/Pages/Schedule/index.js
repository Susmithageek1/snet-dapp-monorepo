import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { withStyles } from "@material-ui/styles";

import CurrentComponent from "./Current";
import PastComponent from "./Past";
import { scheduleActions } from "../../Services/Redux/actionCreators";

import SNETTextfield from "shared/dist/components/SNETTextfield";
import SNETButton from "shared/dist/components/SNETButton";
import ComputeMailsImage from "shared/dist/assets/images/ComputeMails.png";
import { useStyles } from "./styles";

const Schedule = ({ classes }) => {
  const [value, setValue] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  const [scheduleSession, setScheduleSession] = useState([]);
  const dispatch = useDispatch();

  const handleChange = (_event, newValue) => {
    setValue(newValue);
    setSelectedTab(newValue);
  };

  const fetchScheduleSessions = useCallback(async () => {
    try {
      setScheduleSession(await dispatch(scheduleActions.fetchScheduleSessions()));
    } catch (error) {
      // Ignore as we show appropriate error
    }
  }, [dispatch]);

  useEffect(() => {
    fetchScheduleSessions();
  }, [fetchScheduleSessions]);

  return (
    <div className={classes.scheduleMainContainer}>
      <div className={classes.scheduleWrapper}>
        <Typography>Staking Schedule</Typography>
        <AppBar position="static" className={classes.appBar}>
          <Tabs
            className={classes.tabs}
            value={value}
            onChange={handleChange}
            variant="scrollable"
            indicatorColor="primary"
            textColor="primary"
            aria-label="scrollable force tabs example"
          >
            <Tab className={classes.tab} label={<span>Current</span>} value={0} />
            <Tab className={classes.tab} label={<span>Past</span>} value={1} />
          </Tabs>
        </AppBar>
        {selectedTab === 0 && (
          <div className={classes.accordionContainer}>
            <CurrentComponent
              activeSessionDetail={scheduleSession.current}
              upcomingSessions={scheduleSession ? scheduleSession.upcoming : []}
            />
          </div>
        )}
        {selectedTab === 1 && (
          <div className={classes.accordionContainer}>
            <PastComponent pasSessiontData={scheduleSession.past} />
          </div>
        )}
      </div>
      <Grid item xs={12} sm={12} md={12} lg={12} className={classes.signUpContainer}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Typography variant="h2">Staking Notification</Typography>
          <Typography>Get notified by email when the next staking window is open - Don’t miss out!</Typography>
          <form
            action="https://singularitynet.us16.list-manage.com/subscribe/post?u=d74195510c25bf501caf3011d&id=a804df2efd"
            method="post"
            target="_blank"
            name="mc-embedded-subscribe-form"
            noValidate=""
          >
            <SNETTextfield name="EMAIL" label="email" />
            <SNETButton type="submit" children="subscribe" color="primary" variant="contained" />
          </form>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <img src={ComputeMailsImage} alt="Computer And Mails" />
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(useStyles)(Schedule);
