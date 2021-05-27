import React, { Fragment, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import { useStyles } from "./styles";
import SNETButton from "shared/dist/components/SNETButton";
import AlertBox, { alertTypes } from "shared/dist/components/AlertBox";
import SNETTextfield from "shared/dist/components/SNETTextfield";
import TechnicalInfo from "./TechnicalInfo";
import { OrganizationSetupRoutes } from "../OrganizationSetupRouter/Routes";
import { useDispatch, useSelector } from "react-redux";
import SubmitAction from "./SubmitAction";
import validator from "shared/dist/utils/validator";
import { submitOrganizationCostraints } from "../validationConstraints";
import ValidationError from "shared/dist/utils/validationError";
import { organizationActions } from "../../../Services/Redux/actionCreators";
import { organizationTypes } from "../../../Utils/organizationSetup";
import { checkIfKnownError } from "shared/dist/utils/error";
import { generateDetailedErrorMessageFromValidation } from "../../../Utils/validation";

const PublishToBlockchain = ({ classes, handleFinishLater, history }) => {
  const { organization, email, ownerEmail } = useSelector(state => ({
    organization: state.organization,
    email: state.user.email,
    ownerEmail: state.organization.owner,
  }));
  const { name, type, status, uuid, ownerAddress } = organization;
  const [alert, setAlert] = useState({});
  const dispatch = useDispatch();

  const handlePublish = async () => {
    setAlert({});
    try {
      const isNotValid = validator(organization, submitOrganizationCostraints);
      if (isNotValid) {
        const errorMessage = generateDetailedErrorMessageFromValidation(isNotValid);
        return setAlert({ type: alertTypes.ERROR, children: errorMessage });
      }
      if (email !== ownerEmail) {
        throw new ValidationError("Only owner can publish the organization");
      }
      await dispatch(organizationActions.submitForApproval(organization));
      const metadataIpfsUri = await dispatch(organizationActions.publishToIPFS(uuid));
      await dispatch(organizationActions.publishOrganizationInBlockchain(organization, metadataIpfsUri, history));
    } catch (error) {
      if (checkIfKnownError(error)) {
        return setAlert({ type: alertTypes.ERROR, message: error.message });
      }
      setAlert({ type: alertTypes.ERROR, message: "unable to publish. please try later" });
    }
  };

  const handleBack = () => {
    history.push(OrganizationSetupRoutes.REGION.path.replace(":orgUuid", organization.uuid));
  };

  const shouldPublishBeDisabled = () => true || !ownerAddress || email !== ownerEmail;

  return (
    <Fragment>
      <div className={classes.box}>
        <Typography variant="h6">Publish Organization to Blockchain</Typography>
        <Typography className={classes.description}>
          Add your organisation to the blockchain, making sure you enter all relevant information correctly, as once the
          data is submitted you will be unable to edit it.
        </Typography>
        <div className={classes.inputFields}>
          <SNETTextfield
            label="Entity Type"
            name="entity"
            disabled
            value={type}
            list={[
              { value: organizationTypes.ORGANIZATION, label: organizationTypes.ORGANIZATION },
              { value: organizationTypes.INDIVIDUAL, label: organizationTypes.INDIVIDUAL },
            ]}
          />
          <SNETTextfield
            label="Company Organization Name"
            description="The company name is displayed as the provider to users on the AI Marketplace page. "
            name="name"
            disabled
            value={name}
          />
        </div>
        <TechnicalInfo />
      </div>
      <div className={classes.publishAlertContainer}>
        <AlertBox message={alert.message} type={alert.type} children={alert.children} />
      </div>
      <div className={classes.publishAlertContainer}>
        <AlertBox type={alertTypes.WARNING}>
          We have temporarily disabled this action as we are hard forking the AGI token to make it cross chain
          compatible. We will enable it as soon as the hard fork is completed. Read more
          <a
            href="https://blog.singularitynet.io/singularitynet-phase-ii-launch-sequence-activated-agi-token-to-be-hard-forked-to-10ede4b6c89"
            target="_blank"
            rel="noreferrer noopener"
          >
            here
          </a>
        </AlertBox>
      </div>
      <div className={classes.buttonsContainer}>
        <SNETButton color="primary" children="finish later" onClick={handleFinishLater} />
        <SNETButton color="primary" children="back" onClick={handleBack} />
        <SubmitAction status={status} disablePublish={shouldPublishBeDisabled()} handlePublish={handlePublish} />
      </div>
    </Fragment>
  );
};

export default withStyles(useStyles)(PublishToBlockchain);
