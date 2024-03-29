/** @format */

import { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Form,
  Image,
  NavDropdown,
  DropdownButton,
  ButtonGroup,
  Dropdown,
  Button,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { logout, userStatus } from "../api";
import { API_URL } from "../config/index";
import Countdown from "react-countdown";
import Notify from "../components/notification/Notify";
import { useToasts } from "react-toast-notifications";
import { ioInstance } from "../config/socket";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import {
  setDu_time,
  setDis_time,
  setUpdating,
} from "../store/screenReminderSclice";
import Swal from "sweetalert2";
import { setPassAlert, setRun, setAlert } from "../store/taskSlice";
import TimerCustome from "./TimerCustome";
import { FormattedMessage } from "react-intl";
import RenderImage from "../components/cutomeImage/RenderImage";
import DynamicInspiration from "../components/inspiration/DynamicInspiration";
import { Context } from "./Wrapper";
import { setToggle } from "../store/notifySlice";
const Header = () => {
  const { passAaler, alert } = useSelector((state) => state.task);
  //
  const { du_time, dis_time, updating } = useSelector((state) => state.screen);

  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [notification, setNotificatiion] = useState("");
  const [count, setCount] = useState(0);
  const [loadData, setLoadData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(true);
  const [showUserRoute, setShowUserRoute] = useState(false);
  const [webData, setWebData] = useState("");
  const [workspace, setWorkSpaces] = useState([]);
  const [ownSpace, setOwnSpace] = useState("");
  const [current, setCurrent] = useState("");
  const context = useContext(Context);
  // const [lang, setLang] = useState("");

  const handleLogout = async () => {
    const text = context.getCurrent() === 0 ? "Logout..." : "Ausloggen";
    Swal.fire({
      title: text,
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      showConfirmButton: false,
      html: `<div aria-busy="true" class="">
          <svg width="40" height="40" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" aria-label="audio-loading"><defs><linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a"><stop stop-color="green" stop-opacity="0" offset="0%"></stop><stop stop-color="green" stop-opacity=".631" offset="63.146%"></stop><stop stop-color="green" offset="100%"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><g transform="translate(1 1)"><path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="green" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"></animateTransform></path><circle fill="#fff" cx="36" cy="18" r="1"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"></animateTransform></circle></g></g></svg>
          </div>`,
      customClass: { container: "swal-google" },
    });
    const req = await logout();
    if (req.status === 200) {
      localStorage.removeItem("user");
      localStorage.removeItem("search");
      localStorage.removeItem("others");
      localStorage.removeItem("space");
      localStorage.removeItem("own");
      localStorage.removeItem("current");
      // delte spotify data
      localStorage.removeItem("spotToken");
      localStorage.removeItem("spotRefresh");
      // delete screen reminder data
      localStorage.removeItem("duration_time");
      localStorage.removeItem("display_time");
      localStorage.removeItem("screen");
      localStorage.removeItem("prefrence");
      window.location.href = "/";
    } else {
      document.getElementsByClassName("swal-google")[0].remove();
    }
  };
  const handleDurationTime = (val) => {
    const arr = val.split(":");
    const time =
      arr[0] * 24 * 60 * 60 * 1000 + arr[1] * 60 * 1000 + arr[2] * 1000;
    localStorage.setItem("duration_time", time);
    dispatch(setUpdating(false));
    return time;
  };
  const handleDisplayTime = (val) => {
    const arr = val.split(":");
    const time =
      arr[0] * 24 * 60 * 60 * 1000 + arr[1] * 60 * 1000 + arr[2] * 1000;
    localStorage.setItem("display_time", time);
    return time;
  };
  // Notification
  const getNotification = async (load) => {
    if (load) {
      setLoading(true);
      await fetch(`${API_URL}/user/notification`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      }).then(async (res) => {
        const { payload } = await res.json();
        if (payload.length > 0) {
          setNotificatiion(payload);
          setCount(0);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    }
  };
  const countNotification = async () => {
    await fetch(`${API_URL}/user/count-notification`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    }).then(async (res) => {
      const { payload } = await res.json();
      if (payload > 0) {
        dispatch(setToggle({ type: 1, play: true }));
      }
      setCount(payload);
    });
  };
  // accept Joni
  const handleAccept = async (id, from) => {
    setNotificatiion(notification.filter((noti) => noti._id != id));
    const user = JSON.parse(localStorage.getItem("user"));
    await fetch(`${API_URL}/breakPlan/accept`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        to: from,
        notId: id,
        fullName: user.first_name + " " + user.last_name,
        icon: userData?.avatar?.key || "",
      }),
    });
  };
  // Rejeact
  const handleReject = async (id) => {
    setNotificatiion(notification.filter((noti) => noti._id != id));
    await fetch(`${API_URL}/breakPlan/reject`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        notId: id,
      }),
    });
  };
  //
  const handleAcceptTime = async (id, userId, newTime, breakId, breakName) => {
    const el = document.getElementById(breakId);
    const user = JSON.parse(localStorage.getItem("user"));
    await fetch(`${API_URL}/breakPlan/accept-time`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        fullName: user.first_name + " " + user.last_name,
        to: userId,
        notId: id,
        time: newTime,
        breakId: breakId,
        breakName: breakName,
        icon: user?.avatar?.key || "",
      }),
    }).then(async (res) => {
      if (res.status) {
        el.innerHTML = newTime;
        getNotification(true);
      }
    });
  };
  // Clear All Notification
  const clearAll = async () => {
    if (notification.length > 0 && !loading) {
      try {
        setLoading(true);
        await fetch(`${API_URL}/user/clear-all`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true,
          },
        }).then((res) => {
          if (res.status == 200) {
            addToast(
              <FormattedMessage defaultMessage="Cleared" id="noti.alerClear" />,
              { autoDismiss: true, appearance: "success" }
            );
            setNotificatiion([]);
            setLoading(false);
          } else {
            addToast(
              <FormattedMessage
                defaultMessage="Error Please Try Again."
                id="breakPlan.Error"
              />,
              {
                autoDismiss: false,
                appearance: "error",
              }
            );
            setLoading(false);
          }
        });
      } catch {
        addToast(
          <FormattedMessage
            defaultMessage="Error Please Try Again."
            id="breakPlan.Error"
          />,
          {
            autoDismiss: false,
            appearance: "error",
          }
        );
      }
    }
  };
  const handleSwitch = async (space) => {
    Swal.fire({
      title: "Loading...",
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      showConfirmButton: false,
      html: `<div aria-busy="true" class="">
          <svg width="40" height="40" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" aria-label="audio-loading"><defs><linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a"><stop stop-color="green" stop-opacity="0" offset="0%"></stop><stop stop-color="green" stop-opacity=".631" offset="63.146%"></stop><stop stop-color="green" offset="100%"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><g transform="translate(1 1)"><path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="green" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"></animateTransform></path><circle fill="#fff" cx="36" cy="18" r="1"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"></animateTransform></circle></g></g></svg>
          </div>`,
      customClass: { container: "swal-google" },
    });
    const changer = await fetch(`${API_URL}/auth/login/switch`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: space?._id,
        type: 2,
      }),
    });
    if (changer.status === 200) {
      const before = localStorage.getItem("space");
      localStorage.setItem("space", "m");
      if (before !== "m") {
        localStorage.setItem("own", "true");
      }

      localStorage.setItem("current", space?.space_id);

      window.location.href = `/dashboard`;
    }
  };
  const handleSwitchOwn = async () => {
    Swal.fire({
      title: "Loading...",
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      showConfirmButton: false,
      html: `<div aria-busy="true" class="">
          <svg width="40" height="40" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" aria-label="audio-loading"><defs><linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a"><stop stop-color="green" stop-opacity="0" offset="0%"></stop><stop stop-color="green" stop-opacity=".631" offset="63.146%"></stop><stop stop-color="green" offset="100%"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><g transform="translate(1 1)"><path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="green" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"></animateTransform></path><circle fill="#fff" cx="36" cy="18" r="1"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"></animateTransform></circle></g></g></svg>
          </div>`,
      customClass: { container: "swal-google" },
    });
    // get own space type11111111111111!!!1
    const changer = await fetch(`${API_URL}/auth/login/switch`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: ownSpace?.id,
        type: 1,
      }),
    });
    const data = await changer.json();
    if (changer.status === 200) {
      localStorage.setItem("space", data?.type);
      localStorage.setItem("own", "false");
      localStorage.setItem("current", ownSpace?.id);
      window.location.href = `/dashboard`;
    }
  };
  useEffect(() => {
    if (webData) {
      let checkup = "";
      if (localStorage.getItem("current")) {
        checkup = localStorage.getItem("current");
      } else {
        const user = JSON.parse(localStorage.getItem("user"));
        checkup = user?._id;
      }
      if (String(webData) === String(checkup)) {
        //notification related to this user
        setCount(count + 1);
        setWebData("");
      }
    }
  }, [webData]);

  useEffect(() => {
    const type = localStorage.getItem("own");
    const space = localStorage.getItem("space");
    const user = JSON.parse(localStorage.getItem("user"));
    if (type === "true" || space !== "m") {
      setOwnSpace({ id: user?._id, space_name: `${user?.first_name}_space` });
    }
    const currentSpace = localStorage.getItem("current") || user?._id;
    setCurrent(currentSpace);
  }, []);

  useEffect(() => {
    async function getStatus() {
      const req = await userStatus();
      if (req.status !== 200) {
        localStorage.removeItem("user");
        localStorage.removeItem("others");
        localStorage.removeItem("current");
        navigate("/");
      }
    }
    async function getScrrenRemainder() {
      const req = await fetch(`${API_URL}/screen_reminder/get`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      });
      const { payload } = await req.json();
      if (payload) {
        if (payload.mute) {
          localStorage.setItem("screen", "on");
          dispatch(setDu_time(payload.duration));
          dispatch(setDis_time(payload.display));
          handleDurationTime(payload.duration);
          handleDisplayTime(payload.display);
        } else {
          localStorage.setItem("screen", "off");
          dispatch(setDu_time(payload.duration));
          dispatch(setDis_time(payload.display));
          handleDurationTime(payload.duration);
          handleDisplayTime(payload.display);
        }
      } else {
        localStorage.setItem("screen", "off");
        handleDurationTime("01:00:00");
        handleDisplayTime("00:05:00");
      }
    }
    countNotification();
    getScrrenRemainder();
    const user_storage = JSON.parse(localStorage.getItem("user"));
    const space = localStorage.getItem("space");
    const others = JSON.parse(localStorage.getItem("others") || "[]");
    if (others && others?.length > 0) {
      setWorkSpaces(others);
    }

    if (space === "c" || space === "a") {
      setShowUserRoute(true);
    }
    setUserData(user_storage);
    if (user_storage) {
      getStatus();
      ioInstance.on("connect_error", (err) => {
        console.error("socket error!", err);
        ioInstance.close();
      });
      ioInstance.on("notify", (data) => {
        setWebData(data);
      });

      // check status
    } else {
      navigate("/");
    }
    return () => {
      ioInstance.close();
    };
  }, []);

  useEffect(() => {
    if (alert) {
      dispatch(setAlert(false));
      setCount(count + 1);
      dispatch(setRun(false));
    }
    if (passAaler) {
      dispatch(setToggle({ type: 3, play: true }));
      dispatch(setPassAlert(false));
      setCount(count + 1);
    }
  }, [alert, passAaler]);
  // useEffect(() => {
  //   if (lang !== "") {
  //     context.selectLanguage(lang);
  //   }
  // }, [lang]);

  const handleSearchByTag = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    navigate(`/hashtag/${formData.get("search-input")}`);
  };

  return (
    <>
      <TimerCustome count={count} setCount={setCount} />
      <Col className="col-12 header-name text-capitalize">
        <FormattedMessage defaultMessage=" Hi" id="app.hi" />{" "}
        <span id="userFullName">{userData?.first_name}</span>
      </Col>
      {start && (
        <Countdown
          key={`c-4`}
          date={Date.now() + +localStorage.getItem("duration_time")}
          autoStart={start ? true : false}
          onTick={(e) => {
            if (!updating) {
              localStorage.setItem("duration_time", e.total);
            }
          }}
          onComplete={() => {
            setStart(false);
            handleDurationTime(du_time);
            if (localStorage.getItem("screen") === "on") {
              const timeLock = new Date();
              localStorage.setItem(
                "loackTime",
                timeLock.getHours() +
                  ":" +
                  timeLock.getMinutes() +
                  ":" +
                  timeLock.getSeconds()
              );
            }
          }}
          renderer={() => {
            return "";
          }}
        />
      )}

      <div
        id="lockScreenHide"
        className={`${
          localStorage.getItem("screen") === "on" ? "lockScreen" : ""
        } text-center ${!start ? "" : "lockScreenHide"}`}
      >
        {localStorage.getItem("screen") === "on" && !start && (
          <div className="screenDiv">
            <h1>
              <FormattedMessage
                defaultMessage="Screen Lock For"
                id="app.screenLock"
              />
            </h1>
            <Countdown
              key={`c-5`}
              date={Date.now() + +localStorage.getItem("display_time")}
              onTick={(e) => {
                localStorage.setItem("display_time", e.total);
              }}
              onComplete={() => {
                if (localStorage.getItem("screen") === "on") {
                  setStart(true);
                }
                handleDisplayTime(dis_time);
              }}
              // renderer={() => {
              //   return ""
              // }}
            />
          </div>
        )}
        {localStorage.getItem("screen") === "off" && !start && (
          <Countdown
            key={`c-6`}
            date={Date.now() + +localStorage.getItem("display_time")}
            onTick={(e) => {
              localStorage.setItem("display_time", e.total);
              if (localStorage.getItem("screen") === "on") {
                setStart(true);
              }
            }}
            onComplete={() => {
              setStart(true);
              handleDisplayTime(dis_time);
            }}
            renderer={() => {
              return "";
            }}
          />
        )}
      </div>
      <Row className="mb-4">
        <Col className="col-6 text-secondary-dark header-thank mt-3">
          <DynamicInspiration />
        </Col>
        <Col className="col-6 header-col-left">
          <div className="header-icon navy-blue text-center pt-2">
            <NavDropdown
              title={
                <>
                  <Badge className="notify-badge" pill bg="danger">
                    {count}
                  </Badge>
                  <Image
                    onClick={() => {
                      setLoadData(!loadData);
                      getNotification(!loadData);
                    }}
                    className="sidebar-icon"
                    src="/icone/hcphotos-Headshots-1 2.png"
                  />
                </>
              }
              className="navDropdomnIcon notiy "
            >
              <div className="card p-2 card-notify">
                <a
                  onClick={() => {
                    clearAll();
                  }}
                  className="clear-all text-center"
                >
                  <FormattedMessage
                    defaultMessage="Clear all"
                    id="noti.clear"
                  />
                </a>
                {loading ? (
                  <div className="text-center pt-4 pb-4">
                    <Skeleton className="mb-2" height="34px" count={4} />
                  </div>
                ) : notification.length > 0 ? (
                  notification.map((notify) =>
                    notify.type === "invite" ? (
                      <Notify
                        type={notify.type}
                        imgUrl={""}
                        key={notify._id}
                        name={notify.firstName + " " + notify.lastName}
                        date={notify.date}
                        message={notify.msg}
                        footer={
                          <>
                            <Button
                              onClick={() => {
                                //
                                handleAccept(notify._id, notify.from);
                              }}
                              variant="outline-success"
                              className={`btn-notify`}
                            >
                              <FormattedMessage
                                defaultMessage="Accept"
                                id="btn.accept"
                              />
                            </Button>
                            <Button
                              onClick={() => {
                                handleReject(notify._id);
                              }}
                              variant="outline-secondary"
                              className={`btn-notify`}
                            >
                              <FormattedMessage
                                defaultMessage="Reject"
                                id="btn.reject"
                              />
                            </Button>
                          </>
                        }
                      />
                    ) : notify.type == "report" ? (
                      <Notify
                        type={notify.type}
                        icon={notify.icon}
                        key={notify._id}
                        name={
                          notify.icon === "task" ? (
                            "Taskshop"
                          ) : notify.icon === "water" ? (
                            <FormattedMessage
                              defaultMessage="Waterday"
                              id="app.waterHydretion"
                            />
                          ) : (
                            notify.sender
                          )
                        }
                        date={notify.date}
                        message={notify.msg}
                        footer=""
                      />
                    ) : notify.type === "new-time" ? (
                      <Notify
                        type={notify.type}
                        icon={notify.icon}
                        key={notify._id}
                        name={notify.sender}
                        date={notify.date}
                        message={notify.msg}
                        footer={
                          <>
                            <Button
                              onClick={() => {
                                handleAcceptTime(
                                  notify._id,
                                  notify.user_id,
                                  notify.newTime,
                                  notify.breakId,
                                  notify.breakName
                                );
                              }}
                              variant="outline-success"
                              className={`btn-notify`}
                            >
                              <FormattedMessage
                                defaultMessage="Accept"
                                id="btn.accept"
                              />
                            </Button>
                            <Button
                              onClick={() => {
                                handleReject(notify._id);
                              }}
                              variant="outline-secondary"
                              className={`btn-notify`}
                            >
                              <FormattedMessage
                                defaultMessage="Reject"
                                id="btn.reject"
                              />
                            </Button>
                          </>
                        }
                      />
                    ) : (
                      ""
                    )
                  )
                ) : (
                  <div className="text-center pt-2 pb-2">
                    <FormattedMessage
                      defaultMessage="No Notification"
                      id="noti.noNotify"
                    />
                  </div>
                )}
              </div>
            </NavDropdown>
          </div>
          <div className="header-icon navy-blue text-center pro-icon">
            <NavDropdown
              title={
                <RenderImage code={userData?.avatar?.key || ""} type={1} />
              }
              className="navDropdomnIcon"
            >
              <Dropdown.Item as={Link} to="/dashboard/profile">
                <FormattedMessage defaultMessage="Profile" id="prof.profile" />
              </Dropdown.Item>
              {/* <DropdownButton
                as={ButtonGroup}
                id={`dropdown-button-drop-start`}
                drop="start"
                className="subDropdown"
                title={
                  <FormattedMessage
                    defaultMessage="Language"
                    id="app.header.workspace"
                  />
                }
              >
                <Dropdown.Item key={`lang-1`} onClick={() => setLang("en")}>
                  <span className="icon-flage">
                    <Icon icon="flagpack:us" />
                  </span>
                  English
                </Dropdown.Item>
                <Dropdown.Item key={`lang-2`} onClick={() => setLang("de")}>
                  <span className="icon-flage">
                    <Icon icon="flag:de-4x3" />
                  </span>
                  Deutsch
                </Dropdown.Item>
              </DropdownButton> */}
              {workspace.length > 0 && (
                <DropdownButton
                  as={ButtonGroup}
                  id={`dropdown-button-drop-start`}
                  drop="start"
                  className="subDropdown"
                  title={
                    <FormattedMessage
                      defaultMessage="Workspace"
                      id="app.header.workspace"
                    />
                  }
                >
                  {workspace?.map((space, i) => (
                    <Dropdown.Item
                      key={`space-${i}`}
                      onClick={() => handleSwitch(space)}
                    >
                      {space?.space_id === current ? (
                        <span
                          style={{
                            color: "green",
                            marginLeft: "5px",
                            marginRight: "5px",
                          }}
                        >
                          ✔
                        </span>
                      ) : (
                        <span
                          style={{
                            marginLeft: "5px",
                            marginRight: "5px",
                          }}
                        ></span>
                      )}
                      {space?.space_data[0]?.space_name}
                    </Dropdown.Item>
                  ))}
                  {ownSpace?.id && (
                    <Dropdown.Item onClick={() => handleSwitchOwn()}>
                      {ownSpace?.id === current ? (
                        <span
                          style={{
                            color: "green",
                            marginLeft: "5px",
                            marginRight: "5px",
                          }}
                        >
                          ✔
                        </span>
                      ) : (
                        <span
                          style={{
                            marginLeft: "5px",
                            marginRight: "5px",
                          }}
                        ></span>
                      )}
                      {ownSpace?.space_name}
                    </Dropdown.Item>
                  )}
                </DropdownButton>
              )}

              {/*  */}
              {showUserRoute && (
                <NavDropdown.Item as={Link} to="/dashboard/user-management">
                  User Management
                </NavDropdown.Item>
              )}
              <NavDropdown.Item as={Link} to="/dashboard/setting">
                <FormattedMessage defaultMessage="Settings" id="settings" />
              </NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout}>
                <FormattedMessage defaultMessage="Logout" id="prof.logout" />
              </NavDropdown.Item>
            </NavDropdown>
          </div>
          <div className="form-search">
            <Form onSubmit={handleSearchByTag}>
              <Form.Group
                className="mb-3 serach-input input-group"
                controlId="formBasicEmail"
              >
                <i className="search-icon">
                  <Icon icon="ci:search-small" />
                </i>
                <FormattedMessage
                  id="app.searchTag"
                  defaultMessage="Search tags"
                >
                  {(msg) => (
                    <Form.Control
                      className="search-input2"
                      type="search"
                      name="search-input"
                      placeholder={msg}
                    />
                  )}
                </FormattedMessage>
              </Form.Group>
            </Form>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Header;
