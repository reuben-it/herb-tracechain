package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Herb struct {
	HerbID      string `json:"herbId"`
	CollectorID string `json:"collectorId"`
	HerbName    string `json:"herbName"`
	Location    string `json:"location"`
	Quantity    string `json:"quantity"`
	Unit        string `json:"unit"`
	Notes       string `json:"notes"`
	Status      string `json:"status"`
	Timestamp   string `json:"timestamp"`
	ProcessorID string `json:"processorId,omitempty"`
	BatchID string `json:"batchId,omitempty"`
	PackageID string `json:"packageId,omitempty"`
	DistID string `json:"distId,omitempty"`
	TxHash string `json:"txHash,omitempty"`
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (s *SmartContract) RecordHarvest(ctx contractapi.TransactionContextInterface,
	herbID, collectorID, herbName, location, quantity, unit, notes string) error {
	exists, err := s.herbExists(ctx, herbID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("herb %s already exists", herbID)
	}
	herb := Herb{
		HerbID:      herbID,
		CollectorID: collectorID,
		HerbName:    herbName,
		Location:    location,
		Quantity:    quantity,
		Unit:        unit,
		Notes:       notes,
		Status:      "HARVESTED",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
	}
	data, err := json.Marshal(herb)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(herbID, data)
}

func (s *SmartContract) TransferToProcessor(ctx contractapi.TransactionContextInterface,
	herbID, processorID string) error {
	herb, err := s.getHerb(ctx, herbID)
	if err != nil {
		return err
	}
	if herb.Status != "HARVESTED" {
		return fmt.Errorf("herb %s is not in HARVESTED status", herbID)
	}
	herb.Status = "IN_TRANSIT"
	herb.ProcessorID = processorID
	herb.Timestamp = time.Now().UTC().Format(time.RFC3339)
	data, err := json.Marshal(herb)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(herbID, data)
}

func (s *SmartContract) ProcessHerb(ctx contractapi.TransactionContextInterface,
	herbID, batchID string) error {
	herb, err := s.getHerb(ctx, herbID)
	if err != nil {
		return err
	}
	if herb.Status != "IN_TRANSIT" {
		return fmt.Errorf("herb %s is not IN_TRANSIT", herbID)
	}
	herb.Status = "PROCESSING"
	herb.BatchID = batchID
	herb.Timestamp = time.Now().UTC().Format(time.RFC3339)
	data, err := json.Marshal(herb)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(herbID, data)
}

func (s *SmartContract) PackageHerb(ctx contractapi.TransactionContextInterface,
	herbID, packageID string) error {
	herb, err := s.getHerb(ctx, herbID)
	if err != nil {
		return err
	}
	if herb.Status != "PROCESSING" {
		return fmt.Errorf("herb %s is not in PROCESSING status", herbID)
	}
	herb.Status = "PACKAGED"
	herb.PackageID = packageID
	herb.Timestamp = time.Now().UTC().Format(time.RFC3339)
	data, err := json.Marshal(herb)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(herbID, data)
}

func (s *SmartContract) DistributeHerb(ctx contractapi.TransactionContextInterface,
	herbID, distID string) error {
	herb, err := s.getHerb(ctx, herbID)
	if err != nil {
		return err
	}
	if herb.Status != "PACKAGED" {
		return fmt.Errorf("herb %s is not PACKAGED", herbID)
	}
	herb.Status = "DISTRIBUTED"
	herb.DistID = distID
	herb.Timestamp = time.Now().UTC().Format(time.RFC3339)
	data, err := json.Marshal(herb)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(herbID, data)
}

func (s *SmartContract) QueryHerb(ctx contractapi.TransactionContextInterface, herbID string) (string, error) {
	herb, err := s.getHerb(ctx, herbID)
	if err != nil {
		return "", err
	}
	b, err := json.Marshal(herb)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (s *SmartContract) QueryAllHerbs(ctx contractapi.TransactionContextInterface) ([]*Herb, error) {
	iter, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer iter.Close()
	var herbs []*Herb
	for iter.HasNext() {
		res, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var herb Herb
		if err := json.Unmarshal(res.Value, &herb); err != nil {
			continue
		}
		herbs = append(herbs, &herb)
	}
	return herbs, nil
}

func (s *SmartContract) QueryHerbHistory(ctx contractapi.TransactionContextInterface, herbID string) ([]map[string]interface{}, error) {
	iter, err := ctx.GetStub().GetHistoryForKey(herbID)
	if err != nil {
		return nil, err
	}
	defer iter.Close()
	var history []map[string]interface{}
	for iter.HasNext() {
		res, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var herb Herb
		entry := map[string]interface{}{
			"txId":      res.TxId,
			"timestamp": res.Timestamp,
			"isDelete":  res.IsDelete,
		}
		if err := json.Unmarshal(res.Value, &herb); err == nil {
			entry["value"] = herb
		}
		history = append(history, entry)
	}
	return history, nil
}

func (s *SmartContract) QueryByStatus(ctx contractapi.TransactionContextInterface, status string) ([]*Herb, error) {
	all, err := s.QueryAllHerbs(ctx)
	if err != nil {
		return nil, err
	}
	var result []*Herb
	for _, h := range all {
		if h.Status == status {
			result = append(result, h)
		}
	}
	return result, nil
}

func (s *SmartContract) QueryByCollector(ctx contractapi.TransactionContextInterface, collectorID string) ([]*Herb, error) {
	all, err := s.QueryAllHerbs(ctx)
	if err != nil {
		return nil, err
	}
	var result []*Herb
	for _, h := range all {
		if h.CollectorID == collectorID {
			result = append(result, h)
		}
	}
	return result, nil
}

func (s *SmartContract) GetVerificationData(ctx contractapi.TransactionContextInterface, herbID string) (map[string]string, error) {
	herb, err := s.getHerb(ctx, herbID)
	if err != nil {
		return nil, err
	}
	return map[string]string{
		"herbId":    herb.HerbID,
		"herbName":  herb.HerbName,
		"status":    herb.Status,
		"timestamp": herb.Timestamp,
		"txHash":    herb.TxHash,
	}, nil
}

func (s *SmartContract) getHerb(ctx contractapi.TransactionContextInterface, herbID string) (*Herb, error) {
	data, err := ctx.GetStub().GetState(herbID)
	if err != nil {
		return nil, err
	}
	if data == nil {
		return nil, fmt.Errorf("herb %s does not exist", herbID)
	}
	var herb Herb
	if err := json.Unmarshal(data, &herb); err != nil {
		return nil, err
	}
	return &herb, nil
}

func (s *SmartContract) herbExists(ctx contractapi.TransactionContextInterface, herbID string) (bool, error) {
	data, err := ctx.GetStub().GetState(herbID)
	if err != nil {
		return false, err
	}
	return data != nil, nil
}

func main() {
	cc, err := contractapi.NewChaincode(&SmartContract{})
	
	if err != nil {
		panic(err)
	}
	if err := cc.Start(); err != nil {
		panic(err)
	}
}