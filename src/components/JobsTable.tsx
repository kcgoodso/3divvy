import { generateClient } from 'aws-amplify/data';
import { DataGrid } from '@mui/x-data-grid';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from '../../amplify/data/resource';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';
import {
    FormControlLabel,
    TextField,
    Box,
    Button,
    Checkbox,
    styled,
    Divider,
    IconButton,
    Table,
    TableContainer,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableFooter,
    TablePagination,
} from '@mui/material';
import { useEffect, useState } from 'react';

const FORMAT_DATE = (date_str) => {
    let date = new Date(date_str);
    // Extract components from the date object
    let month = date.getMonth() + 1; // Months are zero-indexed
    let day = date.getDate();
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Pad month, day, hours, and minutes with leading zeros if needed
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // Get the last two digits of the year
    year = year.toString().slice(-2);

    // Combine the components into the desired format
    return `${month}/${day}/${year} ${hours}:${minutes}`;
}

const LIST_FORMATTER = (els) =>{
    return (els.length ? els.join(", ") : "None");
}


const JOB_COLUMNS: GridColDef<(typeof rows)[number]>[] = [
    {
        field: 'title',
        headerName: 'Title',
        width: 150,
    },
    {
        field: 'description',
        headerName: 'Description',
        width: 150,
    },
    {
        field: 'requiredMaterials',
        headerName: 'Materials',
        width: 150,
        valueFormatter: LIST_FORMATTER
    },
    {
        field: 'colors',
        headerName: 'Colors',
        width: 150,
        valueFormatter: LIST_FORMATTER
    },
    {
        field: 'createdAt',
        headerName: 'Date Posted',
        width: 150,
        valueFormatter: FORMAT_DATE
    },
    {
        field: 'amountOffered',
        headerName: 'Amount Offered',
        width: 150,
    }
];

export default function JobsTable(props) {
    const filters = props.filters;
    const selectPopup = props.selectPopup;
    const allowDelete = props.allowDelete ?? false;
    const allowEdit = props.allowEdit ?? false;
    const client = generateClient<Schema>();
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    const [jobs, setJobs] = useState([]);
    const [pageTokens, setPageTokens] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchData = async (init, nextPage) => {
        if(init || (hasMorePages && currentPageIndex === pageTokens.length)) {
            const {data: new_jobs, nextToken} = await client.models.Job.list({
                filter: filters,
                limit: 30,
                nextToken: pageTokens[pageTokens.length - 1],
                authMode: 'userPool'
            });

            console.log(new_jobs);

            if(! nextToken) {
                setHasMorePages(false);
            }
            setPageTokens(init ? [nextToken] : [...pageTokens, nextToken]);
            if(init) {
                setJobs(new_jobs.length > 0 ? [new_jobs] : []);
            } else if(new_jobs.length > 0) {
                setJobs([...jobs, new_jobs]);
            }
        }

        if(nextPage) {
            setCurrentPageIndex((pi) => pi + 1);
        }
    }

    useEffect(() => { fetchData(true, false); }, [props.filters]);




    if(jobs.length == 0) {
        return (<p>No jobs matching criteria.</p>);
    }

    const handleSelectionChange = (selection) => {
        setSelectedRows(selection);
    };

    return (
    <>
    <DataGrid 
        checkboxSelection 
        disableMultipleRowSelection={true}
        columns={JOB_COLUMNS} 
        rows={jobs[currentPageIndex-1]} 
        onRowSelectionModelChange={handleSelectionChange}
    />
    {selectedRows.length > 0 && selectPopup(selectedRows[0])}
    <Pagination
        currentPage={currentPageIndex}
        totalPages={pageTokens.length}
        hasMorePages={hasMorePages}
        onPrevious={() => setCurrentPageIndex(currentPageIndex - 1)}
        onNext={() => fetchData(false, true)}
        onChange={(pageIndex) => setCurrentPageIndex(pageIndex)}
    />
    </>);
}
