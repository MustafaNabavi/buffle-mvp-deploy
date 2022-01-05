import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import { COLUMN } from "./constants";
import DropZone from "./DropZone";
import Component from "./Component";

const style = {};
const Column = ({ data, components, handleDrop, path }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag({
        type: COLUMN,
        item: {

            id: data.id,
            children: data.children,
            path
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const opacity = isDragging ? 0 : 1;
    drag(ref);

    const renderComponent = (component, currentPath) => {
        return (
            <Component
                key={component.id}
                data={component}
                components={components}
                path={currentPath}
            />
        );
    };

    return (
        <div
            ref={ref}
            style={{ ...style, opacity }}
            className="base draggable column"
        >
            <div className="weekDaysTime">
                <span className="weekDays">{data.id}</span>
                <span className="taskTime">10.12</span>
            </div>
            <hr className="weekDaysTime-hr" />
            <div className="taskLists">
                {data.children.map((component, index) => {
                    const currentPath = `${path}-${index}`;

                    return (
                        <React.Fragment key={component.id}>
                            <DropZone
                                data={{
                                    path: currentPath,
                                    childrenCount: data.children.length
                                }}
                                onDrop={handleDrop}
                            />
                            {renderComponent(component, currentPath)}
                        </React.Fragment>
                    );
                })}
                <DropZone
                    data={{
                        path: `${path}-${data.children.length}`,
                        childrenCount: data.children.length
                    }}
                    onDrop={handleDrop}
                    isLast
                />
                <div className="new-task-div">
                    <input className="new_task_input" placeholder="New Task" aria-label="New Task" />
                </div>
            </div>
        </div>
    );
};
export default Column;
