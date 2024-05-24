import React, { Dispatch, useState } from "react";
import {
    Grid,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    FormControlLabel,
    Checkbox

} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { AuthUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface FormData {
    title: string;
    description: string;
    amt_offered: number;
}

type CreateJobResult = {
    success: boolean;
    message: string;
};

async function CreateJob({ user, formData }: { user: AuthUser, formData: FormData }): Promise<CreateJobResult> {
    let colors = [];
    let color, val;
    for([color, val] of Object.entries(formData.colors)) {
        if(val) {
            colors.push(color);
        }
    }
 
    let materials = [];
    let material;
    for([material, val] of Object.entries(formData.materials)) {
        if(val) {
            materials.push(material);
        }
    }
 
    const client = generateClient<Schema>();
    let {data: new_job, errors} = await client.models.Job.create({
        submitter: user.userId,
        title: formData.title,
        description: formData.description,
        amountOffered: formData.amt_offered,
        colors: colors,
        requiredMaterials: materials
    });
    if(errors) {
        return { success: false, message: 'Failed to create job.' };
    }
    return { success: true, message: 'Job created successfully.' };
}

type PopUpProps = {
    showPopUp: boolean,
    setShowPopUp: Dispatch<React.SetStateAction<boolean>>,
    setShowAlert:Dispatch<React.SetStateAction<boolean>>,
    setShowAlertMessage: Dispatch<React.SetStateAction<string>>,
    setAlertType: Dispatch<React.SetStateAction<string>>,
    user: AuthUser,
}

export default function Popup({ showPopUp, setShowPopUp, setShowAlert, setShowAlertMessage, setAlertType, user }: PopUpProps) {
    
    const [formData, setFormData] = useState({
        "title": "",
        "description": "",
        "amt_offered": 0,
        'materials': {
            'Plastic': false,
            'Resin': false,
            'CarbonFiber': false
        },
        'colors': {
            'Red': false,
            'White': false,
            'Black': false,
            'Blue': false,
            'Transparent': false
        }
    });

    let onMaterialCheck = (mat, event) => {
        let formDataCopy = JSON.parse(JSON.stringify(formData));
        let checked = event.target.checked;
        formDataCopy.materials[mat] = checked;
        setFormData(formDataCopy);
    }

    let onColorCheck = (col, event) => {
        let formDataCopy = JSON.parse(JSON.stringify(formData));
        let checked = event.target.checked;
        formDataCopy.colors[col] = checked;
        setFormData(formDataCopy);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCreateJob = async() => {
        setShowPopUp(false);
        const result = await CreateJob({ user, formData });
        setShowAlert(true);
        setAlertType(result.success ? "success" : "error")
        setShowAlertMessage(result.message);
    }

    const isDisabled = !formData.title || !formData.description || formData.amt_offered <= 0;

    return (
        <>
            <Dialog 
                open={showPopUp}
                maxWidth="xs"
            >
                <DialogTitle>
                    Create Job
                    <Button
                        onClick={() => setShowPopUp(false)}
                        variant="text"
                        color="error"
                        sx={{position: 'absolute', right: '10px'}}
                    >
                        X
                    </Button>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid
                        container
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Grid item sx={{width: '100%'}}>
                            <TextField
                                required
                                variant="outlined"
                                label="Title"
                                size="small"
                                name="title"
                                fullWidth
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item sx={{width: '100%', padding: '15px 0 15px 0'}}>
                            <TextField
                                required
                                variant="outlined"
                                label="Description"
                                multiline
                                name="description"
                                rows={4}
                                fullWidth
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item sx={{width: '100%'}}>
                            <TextField
                                required
                                variant="outlined"
                                label="Amount"
                                type="number"
                                size="small"
                                name="amt_offered"
                                fullWidth
                                value={formData.amt_offered}
                                onChange={handleChange}
                            />
                        </Grid>
                        <div className='material'>
                            <label>Material</label>
                            <Box className='filters'>
                            {Object.keys(formData.materials).map((mat) => (
                                <FormControlLabel control={<Checkbox 
                                    checked={ formData.materials[mat] }
                                    onChange={ (e) => { onMaterialCheck(mat, e) } }
                                />} label={mat} />
                            ))}
                            </Box>
                        </div>
                        <div className='color'>
                            <label>Color</label>
                            <Box className='filters'>
                                {Object.keys(formData.colors).map((col) => (
                                    <FormControlLabel control={<Checkbox 
                                        checked={ formData.colors[col] }
                                        onChange={ (e) => { onColorCheck(col, e) } }
                                    />} label={col} />
                                ))}
                            </Box>
                        </div>

                        <Grid item sx={{width: '100%'}}>
                            <Button
                                component="label"
                                variant="contained"
                                sx={{margin: '10px 0 10px 0', display: 'flex'}}
                                startIcon={<CloudUploadIcon />}
                            >
                                Upload file
                                <VisuallyHiddenInput type="file" />
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions
                    sx={{display: 'flex', justifyContent: 'center'}}
                >
                    <Button
                        onClick={handleCreateJob}
                        color="primary"
                        variant="contained"
                        disabled={isDisabled}
                    >
                        Create Job
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}