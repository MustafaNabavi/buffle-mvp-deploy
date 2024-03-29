import { React, useState, useEffect, useContext } from "react";
import Item from "../item";
import DropWrapperProject from "./DropWrapperProject";
import { Button, Col, Form } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Modal from "../../modal/modal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  createTask,
  getProject,
  getTask,
  getProjectById,
  updateProject,
  createProject,
  deleteTask,
  setColorToProject,
} from "../../../api";
import { useToasts } from "react-toast-notifications";
import moment from "moment";
import BeatLoader from "react-spinners/BeatLoader";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FormattedMessage } from "react-intl";
import { Context } from "../../../layout/Wrapper";
// paiman changes
import { PROJECT_TYPE } from "../../data/types";

const ProjectManagement = ({
  value,
  handleGet,
  colorChange,
  handleDrop,
  pDrope,
  dateChanged,
}) => {
  const { addToast } = useToasts();
  const context = useContext(Context);
  const MySwal = withReactContent(Swal);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectIdEdit, setProjectIdEdit] = useState("");
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);
  const [newProject, setNewProject] = useState(false);
  const [show, setShow] = useState(false);
  const [showPModal, setShowPModal] = useState(false);
  const handleClosePModal = () => { setShowPModal(false); setCreateColor('') };
  const handleClose = () => { setShow(false); setCreateColor('') }
  const handleShow = () => setShow(true);
  const handleShowPModal = () => setShowPModal(true);
  const [inputTask, setInputTask] = useState({ name: "", day: "", p_id: "" });
  const [id, setId] = useState("");
  const [current, setCurrent] = useState("");
  const [showSkleton, setShowSkleton] = useState(false);
  const [showSkleton2, setShowSkleton2] = useState(false);
  const [createColor, setCreateColor] = useState("");
  async function request() {
    // get project and format
    const req = await getProject();
    const formatP = req?.data?.map((i, n) => {
      return {
        id: n,
        content: i.name,
        description: i.description,
        status: i._id,
        color: i.color,
      };
    });

    setProjects(formatP);
    //get tasks and format
  }
  async function getTaskSRequest() {
    setShowSkleton2(true);
    const data = await getTask();

    const format = data?.data?.map((i, n) => {
      return {
        id: n,
        content: i.name,
        description: i.description,
        status: i.projectId,
        tb_id: i._id,
        date: i.date,
        p_id: i.projectId,
        start_time: i.start_time,
        start_hour: i.start_hour,
        completed: i.status,
        day_of_week: i.day_of_week,
        color: i.project_tasks[0]?.color,
      };
    });
    setItems(format);
    setShowSkleton2(false);
  }

  const handleChecked = (id) => {
    handleGet(id);
    setId(id);
  };

  useEffect(() => {
    request();
    getTaskSRequest();
  }, []);

  useEffect(() => {
    setShowSkleton(true);
    request();
    setNewProject(false);
  }, [newProject]);
  useEffect(() => {
    if (id || value || pDrope) {
      getTaskSRequest();
    }
  }, [id, value, pDrope]);
  // insert task to database for project
  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      const createT = await createTask(inputTask, 0, 0, false, "stop");
      if (createT.status === 200) {
        handleGet(inputTask.name);
        // addToast("Created Susseccfully", {
        //   autoDismiss: true,
        //   appearance: "success",
        // });

        setNewProject(true);
        setInputTask({ name: "", p_id: "" });
      } else {
        addToast(<FormattedMessage
          defaultMessage="Error Please Try Again."
          id="breakPlan.Error"
        />, {
          autoDismiss: false,
          appearance: "error",
        });
        setInputTask({ name: "", p_id: "" });
      }
    }
  };
  const getData = async (id) => {
    setProjectName("");
    setProjectDesc("");
    setProjectIdEdit("");
    handleShow();
    const data = await getProjectById(id);
    setProjectName(data.data.name);
    setProjectDesc(data.data.description);
    setProjectIdEdit(id);
    setCurrent(data.data.color);
  };
  const handleSubmitProject = async () => {
    if (!projectName) {
      setError(<FormattedMessage id="project.required" defaultMessage="Project name is required." />);
      return false;
    } else {
      setError("");
      setloading(true);
      const createP = await createProject(
        projectName,
        projectDesc,
        createColor
      );
      if (createP.status === 200) {
        // addToast("Created Susseccfully", {
        //   autoDismiss: true,
        //   appearance: "success",
        // });
        setCreateColor("");
        setNewProject(true);
        setloading(false);
        setShowPModal(false);
      } else {
        addToast(<FormattedMessage
          defaultMessage="Error Please Try Again."
          id="breakPlan.Error"
        />, {
          autoDismiss: false,
          appearance: "error",
        });
        setloading(false);
        setProjectName("");
        setCreateColor("");
        return true;
      }
      setloading(false);
      setProjectName("");
      setCreateColor("");
      return true;
    }
  };
  const handleSubmit = async () => {
    if (!projectName) {
      setError(<FormattedMessage id="project.required" defaultMessage="Project name is required." />);
      return false;
    } else {
      setError("");
      setloading(true);
      const updateP = await updateProject(
        projectIdEdit,
        projectName,
        projectDesc
      );
      await setColorToProject(projectIdEdit, current);
      if (updateP.status === 200) {
        // addToast("Updated Susseccfully", {
        //   autoDismiss: true,
        //   appearance: "success",
        // });
        request();
        getTaskSRequest();
        colorChange(current);
        setloading(false);
        setShow(false);
        setCreateColor('');
        setProjectIdEdit('');
      } else {
        addToast(<FormattedMessage
          defaultMessage="Error Please Try Again."
          id="breakPlan.Error"
        />, {
          autoDismiss: false,
          appearance: "error",
        });
        setloading(false);
        setProjectName("");
        setCreateColor('');
        setProjectIdEdit('');
        return true;
      }
      setloading(false);
      setProjectName("");
      setCreateColor('');
      setProjectIdEdit('');
      return true;
    }
  };
  const onDrop = (item, monitor, status) => {
    setItems((prevState) => {
      const newItems = prevState
        .filter((i) => i.id !== item.id)
        .concat({ ...item, status });
      return [...newItems];
    });
  };
  const moveItem = (dragIndex, hoverIndex) => {
    const item = items[dragIndex];
    setItems((prevState) => {
      const newItems = prevState.filter((i, idx) => idx !== dragIndex);
      newItems.splice(hoverIndex, 0, item);
      return [...newItems];
    });
  };

  const handleDelete = async (id) => {
    const titleMsg =
      context.getCurrent() === 0 ? "Are you sure?" : "Bist du dir sicher?";
    MySwal.fire({
      title: titleMsg,
      text:
        context.getCurrent() === 0
          ? "You won't be able to revert this."
          : "Änderungen sind nicht mehr möglich.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: context.getCurrent() === 0 ? "Cancel" : "Abbrechen",
      confirmButtonText: context.getCurrent() === 0 ? "Yes" : "Fortfahren",
      reverseButtons: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteT = await deleteTask(id);

          if (deleteT.status === 200) {
            const msg = context.getCurrent() === 0 ? "Deleted" : "gelöscht";

            const msg2 =
              context.getCurrent() === 0
                ? "Your file has been deleted."
                : "Gelöscht,Ihre Datei wurde gelöscht.";
            Swal.fire(msg, msg2, "success");
            handleClose();
            const d = items.filter((i) => i.tb_id !== id);
            setItems(d);
            handleGet(id);
          } else {
            addToast(<FormattedMessage
              defaultMessage="Error Please Try Again."
              id="breakPlan.Error"
            />, {
              appearance: "error",
              autoDismiss: true,
            });
            handleClose();
          }
        } catch (error) {
          addToast(<FormattedMessage
            defaultMessage="Error Please Try Again."
            id="breakPlan.Error"
          />, {
            appearance: "error",
            autoDismiss: true,
          });
          handleClose();
        }
      }
    });
  };
  if (loading) {
    return (
      <Row>
        <Col className="text-center">
          <BeatLoader />
        </Col>
      </Row>
    );
  }


  const setColor = (value) => {
    const color = value.split(":");
    const color2 =
      color[1].slice(0, color[1].length - 1) +
      color[1].slice(color[1].length, color[1].length);
    setCreateColor(color2);
  };
  const setUpdateColor = (value) => {
    const color = value.split(":");
    const color2 =
      color[1].slice(0, color[1].length - 1) +
      color[1].slice(color[1].length, color[1].length);
    setCurrent(color2);
  };
  return (
    <>
      <Row className="creat-project-row">
        <Col lg="6">
          <FormattedMessage id="pro.projects" defaultMessage="Projects" />
        </Col>
        <Col lg="6" className="creat-project-col">
          <div className="creat-project-div">
            <span className="creat-project-btn" onClick={handleShowPModal}>
              <span className="creat-project-plus">
                <Icon icon="bi:plus-lg" />
              </span>
              <FormattedMessage
                id="pro.createPro"
                defaultMessage="Create Project"
              />
            </span>
          </div>
        </Col>
        <Modal
          show={showPModal}
          handleClose={handleClosePModal}
          title={
            <FormattedMessage
              id="pro.createPro"
              defaultMessage="Create Project"
            />
          }
          body={
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <label>
                    <FormattedMessage
                      id="pro.proName"
                      defaultMessage="Project Name"
                    />
                  </label>
                  <FormattedMessage
                    id="place.projectName"
                    defaultMessage="Name your project"
                  >
                    {(msg) => (
                      <Form.Control
                        type="text"
                        className={`${error.length > 0
                          ? "red-border-input"
                          : "no-border-input"
                          }`}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder={msg}
                      />
                    )}
                  </FormattedMessage>

                  {error ? (
                    <div className="invalid-feedback d-block">{error}</div>
                  ) : null}
                </Form.Group>
                <Form.Group className="update-project-textarea">
                  <label>
                    <FormattedMessage
                      id="pro.proDesc"
                      defaultMessage="Project Description"
                    />
                  </label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    onChange={(e) => setProjectDesc(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <label>
                    <FormattedMessage
                      id="pro.proColor"
                      defaultMessage="Color"
                    />
                  </label>
                  <div className="bt_1rsx30z">
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(56, 103, 214)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(56, 103, 214)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(136, 84, 208)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(136, 84, 208)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(235, 59, 90)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(235, 59, 90)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(250, 130, 49)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(250, 130, 49)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(247, 183, 49)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(247, 183, 49)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(32, 191, 107)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(32, 191, 107)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(45, 152, 218)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(45, 152, 218)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                    <div
                      className={`bt_1ln56ky ${createColor === " rgb(247, 143, 179)" ? "current" : ""
                        }`}
                      style={{ background: "rgb(247, 143, 179)" }}
                      onClick={(e) => setColor(e.target.getAttribute("style"))}
                    ></div>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          }
          footer={
            <>
              {loading === true ? (
                <Button variant="primary">
                  <BeatLoader />
                </Button>
              ) : (
                <Button variant="primary" title="" onClick={handleSubmitProject}>
                  <FormattedMessage id="btn.save" defaultMessage="Save" />
                </Button>
              )}
              <Button variant="outline-dark" title="" onClick={handleClosePModal}>
                <FormattedMessage id="btn.close" defaultMessage="Close" />
              </Button>
            </>
          }
        />
      </Row>
      <Row className="projectManagement">
        {projects.length === 0 ? (
          <Row>
            <Col className="text-center">No Project</Col>
          </Row>
        ) : (
          projects.map((s) => {
            return (
              <Col key={s.id} className={"col-wrapper secondary-dark"}>
                <Row className={"col-header"}>
                  <header className="bt_k3dhnz">
                    <div>
                      <div className="bt_gs849b">
                        <div>
                          <div
                            className="bt_1t4hv5t"
                            style={{ background: s.color }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <p className="bt_1j944bq">{s.content}</p>
                    <div className="bt_jvz5b9"></div>
                    <Icon
                      icon="icon-park-outline:setting"
                      className="edit project-setting-icon"
                      onClick={() => getData(s.status)}
                    />
                  </header>
                </Row>
                <hr className="task-manage-hr" />
                <DropWrapperProject
                  onDrop={onDrop}
                  status={s.status}
                  statuses={projects}
                  handleDrop={handleDrop}
                >
                  <Col>
                    {showSkleton2 ? (
                      <Skeleton
                        className="important-today-skeleton"
                        count={1}
                      />
                    ) : (
                      items
                        .filter((i) => i.status === s.status)
                        .map((i, idx) => (
                          <Item
                            key={i.id}
                            item={i}
                            PTYPE={PROJECT_TYPE}
                            index={idx}
                            moveItem={moveItem}
                            status={s}
                            className="project_item"
                            handleChecked={handleChecked}
                            handleGet={handleGet}
                            handleDelete={handleDelete}
                          ></Item>
                        ))
                    )}
                    <div className="new-task-div">
                      <Form.Group className="mb-3" controlId="form-new-task">
                        <FormattedMessage
                          id="task.new"
                          defaultMessage="New Task"
                        >
                          {(msg) => (
                            <input
                              type="text"
                              className="new_task_input"
                              placeholder={msg}
                              aria-label="New Task"
                              onChange={(e) =>
                                setInputTask({
                                  name: e.target.value,
                                  day: moment(
                                    new Date(),
                                    "YYYY-MM-DD HH:mm:ss"
                                  ).format("dddd"),
                                  p_id: s.status,
                                })
                              }
                              onKeyDown={handleKeyDown}
                              value={inputTask.name}
                            />
                          )}
                        </FormattedMessage>
                      </Form.Group>
                    </div>
                  </Col>
                </DropWrapperProject>
              </Col>
            );
          })
        )}
        <Modal
          show={show}
          handleClose={handleClose}
          title={
            <FormattedMessage
              id="pro.updatePro"
              defaultMessage="Update Project"
            />
          }
          body={
            <Row>
              <Col md={12}>
                {projectName.length > 0 ? (
                  <>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <label>
                        <FormattedMessage
                          id="pro.proName"
                          defaultMessage="Project Name"
                        />
                      </label>
                      <Form.Control
                        type="text"
                        placeholder="Name your project..."
                        defaultValue={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                      {error ? (
                        <div className="invalid-feedback d-block">{error}</div>
                      ) : null}
                    </Form.Group>
                    <Form.Group className="update-project-textarea">
                      <label>
                        <FormattedMessage
                          id="pro.proDesc"
                          defaultMessage="Project Description"
                        />
                      </label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        defaultValue={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group>
                      <label>
                        <FormattedMessage
                          id="pro.proColor"
                          defaultMessage="Color"
                        />
                      </label>
                      <div className="bt_1rsx30z">
                        <div
                          className={`bt_1ln56ky ${current === " rgb(56, 103, 214)" ? "current" : ''}`}
                          style={{ background: "rgb(56, 103, 214)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                        <div
                          className={`bt_1ln56ky ${current === " rgb(136, 84, 208)" ? "current" : ''
                            }`}
                          style={{ background: "rgb(136, 84, 208)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                        <div
                          className={`bt_1ln56ky ${current === " rgb(235, 59, 90)" ? "current" : ''
                            }`}
                          style={{ background: "rgb(235, 59, 90)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                        <div
                          className={`bt_1ln56ky ${current === " rgb(250, 130, 49)" ? "current" : ''
                            }`}
                          style={{ background: "rgb(250, 130, 49)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                        <div
                          className={`bt_1ln56ky ${current === " rgb(247, 183, 49)" ? "current" : ''
                            }`}
                          style={{ background: "rgb(247, 183, 49)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                        <div
                          className={`bt_1ln56ky ${current === " rgb(32, 191, 107)" ? "current" : ''
                            }`}
                          style={{ background: "rgb(32, 191, 107)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                        <div
                          className={`bt_1ln56ky ${current === " rgb(45, 152, 218)" ? "current" : ''
                            }`}
                          style={{ background: "rgb(45, 152, 218)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                        <div
                          className={`bt_1ln56ky ${current === " rgb(247, 143, 179)" ? "current" : ''
                            }`}
                          style={{ background: "rgb(247, 143, 179)" }}
                          onClick={(e) =>
                            setUpdateColor(e.target.getAttribute("style"))
                          }
                        ></div>
                      </div>
                    </Form.Group>
                  </>
                ) : (
                  <Row>
                    <Col className="text-center" xl="12">
                      <BeatLoader />
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
          }
          footer={
            <>
              {loading === true ? (
                <Button variant="primary">
                  <BeatLoader />
                </Button>
              ) : (
                <Button variant="primary" title="" onClick={handleSubmit}>
                  <FormattedMessage id="btn.save" defaultMessage="Save" />
                </Button>
              )}
              <Button variant="outline-dark" title="" onClick={handleClose}>
                <FormattedMessage id="btn.close" defaultMessage="Close" />
              </Button>
            </>
          }
        />
      </Row>
    </>
  );
};
export default ProjectManagement;
