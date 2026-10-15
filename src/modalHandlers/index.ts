import completeVerificationModal from "./completeVerificationModal.js";
import denyVerificationModal from "./denyVerificationModal.js";
import verifyModal from "./verifyModal.js";

export let modalHandlers: Record<string, ModalHandler> = {
    "completeVerificationModal": completeVerificationModal,
    "denyVerificationModal": denyVerificationModal,
    "verifyModal": verifyModal,
    "verifyCommandModal": verifyModal
};
