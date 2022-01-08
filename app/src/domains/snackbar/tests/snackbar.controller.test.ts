import { SnackbarController } from "../snackbar.controller";
import { SnackbarModel } from "../snackbar.model";

describe("snackbar controller", () => {
  let model: SnackbarModel;
  let ctrl: SnackbarController;

  beforeEach(() => {
    model = new SnackbarModel();
    ctrl = new SnackbarController(model);
  });

  it("adding single snack message opens snackbar and displays the message", () => {
    expect(model.messageList.length).toEqual(0);

    ctrl.sendSuccess("hooray!");

    expect(model.message?.text).toEqual("hooray!");
    expect(model.open).toEqual(true);
  });

  it("adding multiple snack messages opens snackbar, displays the first message and adds rest to que", () => {
    expect(model.messageList.length).toEqual(0);

    ctrl.sendSuccess("hooray!");
    ctrl.sendError("oh no!");
    ctrl.sendInfo("did you know...");

    expect(model.message?.text).toEqual("hooray!");
    expect(model.open).toEqual(true);
    expect(model.messageList.length).toEqual(2);
  });

  it("closing snackbar removes msg and hides snackbar", () => {
    // add msg
    ctrl.sendSuccess("hooray!");
    // its there
    expect(model.message?.text).toEqual("hooray!");
    expect(model.open).toEqual(true);

    // now close it
    ctrl.handleSnackClose({} as any);

    expect(model.message).toEqual(undefined);
    expect(model.open).toEqual(false);
  });

  it("closing snackbar removes msg and displays next msg from que if it exist", () => {
    // add msgs
    ctrl.sendSuccess("hooray!");
    ctrl.sendError("oh no!");
    // its there
    expect(model.message?.text).toEqual("hooray!");
    expect(model.open).toEqual(true);
    // there is still one more msg
    expect(model.messageList.length).toEqual(1);

    // now close the first one
    ctrl.handleSnackClose({} as any);

    expect(model.messageList.length).toEqual(0);
    expect(model.message?.text).toEqual("oh no!");
    expect(model.open).toEqual(true);

    // now close the second one
    ctrl.handleSnackClose({} as any);

    // all done
    expect(model.message).toEqual(undefined);
    expect(model.open).toEqual(false);
    // there is still one more msg
    expect(model.messageList.length).toEqual(0);
  });

  it("snack severity: success", () => {
    ctrl.sendSuccess("hooray!");

    expect(model.message?.text).toEqual("hooray!");
    expect(model.message?.severity).toEqual("success");
  });

  it("snack severity: info", () => {
    ctrl.sendInfo("???");

    expect(model.message?.text).toEqual("???");
    expect(model.message?.severity).toEqual("info");
  });

  it("snack severity: error", () => {
    ctrl.sendError("oh no!");

    expect(model.message?.text).toEqual("oh no!");
    expect(model.message?.severity).toEqual("error");
  });
});
