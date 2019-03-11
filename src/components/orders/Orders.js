import React from 'react';
import NavBar from '../navbar/Navbar';
import logo from '../../assets/img/logo_dark_bg.svg';
import { Paper } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import OrderList from '../order-list/OrderList';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    ordersBox: {
        marginTop: '20px'
    }
});

class Orders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showColumnHighLight: [false, false, false],
            columnsData: [
                [
                    {id: 1, userNote: 'Please this should be ASAP!', description: 'Two aspirins', name: 'Order name #1', userProfileImage: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'},
                    {id: 2, description: '1/3 grams of oil', name: 'Order name #2', userProfileImage: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'},
                    {id: 3, userNote: 'Please let it be winasorb for headched', description: '1/2 winasorb box', name: 'Order name #3', userProfileImage: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'},
                    {id: 4, description: 'Axpirins 5 boxes', name: 'Order name #4', userProfileImage: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                ],
                [
    
                ],
                [
    
                ]
            ]
        };
    }

    handleDragEnd = (event) => {
        console.log('Order component');
        console.log(event);
        const { columnsData, showColumnHighLight } = this.state;

        let destination = event.destination;
        let source = event.source;
        let itemId = event.draggableId;

        if(!!destination && !!source) {

            // Old data values
            let newOrders = columnsData[0];
            let progressOrders = columnsData[1];
            let deliveredOrders = columnsData[2];

            //Get destinatino column
            let destColumnId = destination.droppableId;
            let destColumn = columnsData[destColumnId-1];

            //Get source column
            let sourceColumnId = source.droppableId;
            let sourceColumn = columnsData[sourceColumnId-1];

            console.log(destColumnId);
            console.log(destColumn);

            console.log(sourceColumnId);
            console.log(sourceColumn);

            //Get dragged item
            let item = columnsData[sourceColumnId-1].filter(x => x.id === itemId)[0];

            destColumn.push(item);
            // Get index of item in list
            let idx = sourceColumn.indexOf(item);
            sourceColumn = sourceColumn.splice(idx, 1);

            columnsData[0] = newOrders;
            columnsData[1] = progressOrders;
            columnsData[2] = deliveredOrders;

            this.setState({
                columnsData: columnsData
            });

        } else {
            console.log('Source and destination cannot be null.');
        }

        showColumnHighLight[0] = false;
        showColumnHighLight[1] = false;
        showColumnHighLight[2] = false;

        this.setState({
            showColumnHighLight: showColumnHighLight
        });

    }

    handleDragStart = (event) => {
        console.log('STARTING DRAG');
        console.log(event);
        /** Highlith next column border */
        const { showColumnHighLight } = this.state;
        let columnId = event.source.droppableId;
        showColumnHighLight[columnId] = true; // WARNING: this starts from zero

        console.log('columnID: ' + columnId);
        if(columnId == 3) {
            showColumnHighLight[columnId] = false;
            showColumnHighLight[columnId-2] = true;
        }

        this.setState({
            showColumnHighLight: showColumnHighLight
        });
    }

    render() {
        const { classes } = this.props;
        const { columnsData, showColumnHighLight } = this.state;
        let newsId = 1;
        let progressId = 2;
        let deliveredId = 3;

        console.log(showColumnHighLight);

        return (
           <DragDropContext onDragEnd={this.handleDragEnd} onDragStart={this.handleDragStart}>
                <div className={classes.root}>
                    <Grid container>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                New orders
                            </Paper>
                            <div className={classes.ordersBox}>
                                <OrderList 
                                    showHighlight={showColumnHighLight[0]}
                                    droppableId={newsId}
                                    onDragItem={this.handleDrag}
                                    orders={columnsData[newsId-1]} />
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                In progress orders
                            </Paper>
                            <div className={classes.ordersBox}>
                                 <OrderList 
                                    showHighlight={showColumnHighLight[1]}
                                    droppableId={progressId}
                                    onDragItem={this.handleDrag}
                                    orders={columnsData[progressId-1]} />
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                Delivered orders
                            </Paper>
                            <div className={classes.ordersBox}>
                                    <OrderList 
                                        showHighlight={showColumnHighLight[2]}
                                        droppableId={deliveredId}
                                        onDragItem={this.handleDrag}
                                        orders={columnsData[deliveredId-1]} />   
                            </div>
                        </Grid>
                    </Grid>
                </div>
           </DragDropContext>
        );
    }
}

export default withStyles(styles)(Orders);