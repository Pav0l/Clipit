package pinata

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"strconv"
)

type Pinata struct {
	client http.Client
	host string
	jwt string
}

func NewPinata(jwt string) *Pinata {
	return &Pinata{
		client: http.Client{},
		host: "https://api.pinata.cloud",
		jwt: jwt,
	}
}

type Body struct {
	IpfsHash string
	PinSize uint
	Timestamp string
}

func (pinata *Pinata) UploadJSON(payload io.Reader) (Body, error) {
	url := pinata.host + "/pinning/pinJSONToIPFS"
  req, err := http.NewRequest("POST", url, payload)
  if err != nil {
		return Body{}, err
  }

  req.Header.Add("Authorization", "Bearer " + pinata.jwt)
	req.Header.Set("Content-Type", "application/json")

	resp, err := pinata.client.Do(req)
  if err != nil {
    return Body{}, err
  }
  defer resp.Body.Close()

	log.Println("pinJSON status:", resp.Status)

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return Body{}, err
		}
		log.Println("resp err", string(msg))

		return Body{}, errors.New(string(msg))
	}
	
	var body Body
	if err = json.NewDecoder(resp.Body).Decode(&body); err != nil {
    return Body{}, err
  }

	return body, nil
}

// Upload stores a file via Pinata /pinning/pinFileToIPFS API to IPFS
func (pinata *Pinata) UploadFile(id string, filename string, wrapWithDirectory bool, data []byte) (Body, error) {	
	payload, contentType, err := preparePayload(id, filename, wrapWithDirectory, data)
	if err != nil {
		return Body{}, err
  }

	log.Println("sending request to pinata")
	
	url := pinata.host + "/pinning/pinFileToIPFS"
  req, err := http.NewRequest("POST", url, payload)
  if err != nil {
		return Body{}, err
  }

  req.Header.Add("Authorization", "Bearer " + pinata.jwt)
	req.Header.Set("Content-Type", contentType)

  resp, err := pinata.client.Do(req)
  if err != nil {
    return Body{}, err
  }
  defer resp.Body.Close()

	log.Println("pinFile status:", resp.Status)

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return Body{}, err
		}
		log.Println("resp err", string(msg))

		return Body{}, errors.New(string(msg))
	}
	
	var body Body
	if err = json.NewDecoder(resp.Body).Decode(&body); err != nil {
    return Body{}, err
  }

	return body, nil
}

// Unping allows the sender to unpin content they previously uploaded to Pinata's IPFS nodes
func (pinata *Pinata) Unpin(cid string) (error) {
	
	url := pinata.host + "/pinning/unpin/" + cid
  req, err := http.NewRequest("DELETE", url, nil)
  if err != nil {
		return err
  }

  req.Header.Add("Authorization", "Bearer " + pinata.jwt)

  resp, err := pinata.client.Do(req)
  if err != nil {
    return err
  }
  defer resp.Body.Close()

	log.Println("unpin status:", cid, resp.Status)

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		log.Println("resp err", string(msg))

		return errors.New(string(msg))
	}

	return nil
}

type Pin struct {
	IpfsPinHash string `json:"ipfs_pin_hash"`
}
type PinList struct {
	Count uint `json:"count"`
	Rows []Pin `json:"rows"`
}

// PinList returns data on what content the sender has pinned to IPFS through Pinata
func (pinata *Pinata) GetPinned() (PinList, error) {
	
	url := pinata.host + "/data/pinList"
  req, err := http.NewRequest("GET", url, nil)
  if err != nil {
		return PinList{}, err
  }

  req.Header.Add("Authorization", "Bearer " + pinata.jwt)

	q := req.URL.Query()
	q.Add("status", "pinned")
	q.Add("pageLimit", "100")
	req.URL.RawQuery = q.Encode()

  resp, err := pinata.client.Do(req)
  if err != nil {
    return PinList{}, err
  }
  defer resp.Body.Close()

	log.Println("pinList status:", resp.Status)

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return PinList{}, err
		}
		log.Println("resp err", string(msg))

		return PinList{}, errors.New(string(msg))
	}
	
	var body PinList
	if err = json.NewDecoder(resp.Body).Decode(&body); err != nil {
    return PinList{}, err
  }

	return body, nil
}

func preparePayload(id string, filename string, wrapWithDirectory bool, video []byte) (*bytes.Buffer, string, error) {
	payload := &bytes.Buffer{}

	writer := multipart.NewWriter(payload)
	dst, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return &bytes.Buffer{}, "", err
	}
  // w, err := io.Copy(dst, file)
	_, err = dst.Write(video)
	if err != nil {
		return &bytes.Buffer{}, "", err
	}

	if err != nil {
		return &bytes.Buffer{}, "", err
	}
	log.Println(fmt.Sprintf("storing file with %d bytes", len(video)))

	_ = writer.WriteField("pinataOptions", fmt.Sprintf("{\"wrapWithDirectory\": %s,\"cidVersion\": \"1\"}", strconv.FormatBool(wrapWithDirectory)))
  _ = writer.WriteField("pinataMetadata", fmt.Sprintf("{\"name\":\"%s\",\"keyvalues\":{\"id\":\"%s\"}}", filename, id))

	err = writer.Close()
  if err != nil {
    return &bytes.Buffer{}, "", err
  }

	return payload, writer.FormDataContentType(), nil
}
